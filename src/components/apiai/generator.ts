import * as archiver from "archiver";
import { GenericIntent, PlatformGenerator } from "assistant-source";
import * as fs from "fs";
import { inject, injectable } from "inversify";
import { Component, getMetaInjectionName } from "inversify-components";
import { v4 as uuid } from "uuid";
import DialogflowEventStore from "./dialogflow-event-store";
import { genericIntentToApiai } from "./intent-dict";
import { COMPONENT_NAME, Configuration } from "./private-interfaces";

// tslint:disable:no-console
@injectable()
export class Generator implements PlatformGenerator.Extension {
  private currentBuildDir: string = "";
  private intentDirectory: string = "";
  private entitiesDirectory: string = "";
  private language: string = "";
  constructor(@inject(getMetaInjectionName(COMPONENT_NAME)) private component: Component<Configuration.Runtime>) {}

  public execute(
    language: string,
    buildDir: string,
    intentConfigurations: PlatformGenerator.IntentConfiguration[],
    entityMapping: PlatformGenerator.EntityMapping,
    customEntityMapping: PlatformGenerator.CustomEntityMapping
  ) {
    this.language = language;
    this.currentBuildDir = buildDir + "/apiai";
    this.intentDirectory = this.currentBuildDir + "/intents";
    this.entitiesDirectory = this.currentBuildDir + "/entities";

    console.log("=============     PROCESSING ON APIAI     ============");
    console.log("Intents: #" + intentConfigurations.length + ", language: " + language);

    console.log("validating...");
    const convertedIntents = this.prepareConfiguration(intentConfigurations);

    console.log("building entities (" + Object.keys(customEntityMapping).length + ")...");
    const customEntities = this.buildCustomEntities(customEntityMapping);

    console.log("building intents (" + convertedIntents.length + ")...");
    const intents = this.buildIntents(convertedIntents, entityMapping, customEntityMapping);
    intents.push(this.buildDefaultIntent());

    this.createBuildDirectory();

    console.log("writing to files...");

    // Write intents and utterances
    intents.forEach(intent => this.writeIntentAndUtterancesFiles(intent));

    // Write custom entities
    customEntities.forEach(entity => this.writeCustomEntitiesFiles(entity));

    this.writePackageJSON(this.currentBuildDir);

    console.log("writing bundled zip...");

    /** Move generated configuration files to a zip file */
    this.createBundleFile();

    console.log("=============          FINISHED.          =============");
  }

  /**
   * Return custom entities in Dialogflow schema syntax.
   * @param entityMapping
   */
  public buildCustomEntities(customEntityMapping: PlatformGenerator.CustomEntityMapping) {
    const config = this.component.configuration;

    return Object.keys(customEntityMapping).map(type => {
      if (typeof config.entities[type] !== "undefined") {
        const entity = {
          id: uuid(),
          name: type,
          isOverridable: true,
          isEnum: false,
          automatedExpansion: false,
        };
        const entries = customEntityMapping[type];
        return { entity, entries };
      }
    });
  }

  /**
   * Returns Intent Schema for Dialogflow schema config
   * @param preparedIntentConfiguration: Result of prepareConfiguration()
   */
  public buildIntents(
    preparedIntentConfiguration: PreparedIntentConfiguration[],
    entityMapping: PlatformGenerator.EntityMapping,
    customEntityMapping: PlatformGenerator.CustomEntityMapping
  ) {
    return preparedIntentConfiguration.map(config => {
      const intent = {
        id: uuid(),
        name: config.intent,
        auto: true,
        contexts: [],
        responses: [
          {
            resetContexts: false,
            affectedContexts: [],
            parameters: this.makeIntentParameters(config.entities, entityMapping, customEntityMapping),
            messages: [{ type: 0, lang: "en", speech: [] }],
            defaultResponsePlatforms: {},
            speech: [],
          },
        ],
        priority: 500000,
        webhookUsed: true,
        webhookForSlotFilling: false,
        lastUpdate: this.getUnixTime(),
        fallbackIntent: false,
        events: this.prepareIntentEvents(config.intent),
      };

      const utterances = config.utterances.map(utterance => this.buildUtterance(utterance, entityMapping, customEntityMapping));

      const result = { intent, utterances };
      return result;
    });
  }
  /**
   * Write necessary package.json with version into folder
   */
  public writePackageJSON(currentBuildDir: string) {
    fs.writeFileSync(currentBuildDir + "/package.json", JSON.stringify({ version: "1.0.0" }, null, 2));
  }

  /** Returns  */
  public buildDefaultIntent(): any {
    const intent = {
      templates: [],
      userSays: [],
      id: uuid(),
      name: "__unhandled",
      auto: false,
      contexts: [],
      responses: [
        {
          resetContexts: false,
          action: "input.unknown",
          affectedContexts: [],
          parameters: [],
          messages: [
            {
              type: 0,
              speech: [],
            },
          ],
        },
      ],
      webhookUsed: true,
      webhookForSlotFilling: false,
      fallbackIntent: true,
      events: [],
    };

    const utterances = [];

    const result = {
      intent,
      utterances,
    };
    return result;
  }

  /**
   * Returns single utterance json for intent schema
   * @param utterance Utterange string
   * @param entityMapping Mapping of entities
   * @param customEntityMapping Mapping of custom entities
   */
  public buildUtterance(utterance: string, entityMapping: PlatformGenerator.EntityMapping, customEntityMapping: PlatformGenerator.CustomEntityMapping) {
    const result = {
      id: uuid(),
      count: 0,
    };
    const utteranceData: Array<{}> = [];
    // Extract template entities from utterance
    const utteranceTemplateEntities = utterance.match(/\{\{.+[\|]{1}(\w+)*\}\}/g);

    if (utteranceTemplateEntities) {
      // Separate simple text from entities and remove ending whitespaces
      const utteranceSplits = utterance.split(/(\{\{.*\}\})/).filter(split => /\S/.test(split));
      utteranceData.push(
        ...utteranceSplits.map(split => {
          // Check whether an entitiy exists
          const entity = utteranceTemplateEntities.find(param => param === split);
          if (typeof entity !== "undefined") {
            // Extract value and name of entity
            const [value, name] = entity.replace(/[{()}]/g, "").split("|", 2);
            const paramType = this.getParameterTypeFor(name, entityMapping, customEntityMapping);
            return {
              text: value,
              alias: name,
              userDefined: true,
              meta: `${paramType}`,
            };
          }
          return {
            text: split,
            userDefined: false,
          };
        })
      );
      // Return utterance in example mode
      return { ...result, data: utteranceData, isTemplate: false };
    }

    utteranceData.push({
      text: utterance.replace(/\{\{(\w+)\}\}/g, (match: string, value: string) => {
        return `${this.getParameterTypeFor(value, entityMapping, customEntityMapping)}:${value}`;
      }),
      userDefined: false,
    });
    // Return utterance in template mode
    return { ...result, data: utteranceData, isTemplate: true };
  }

  /** Returns BuildIntentConfiguration[] but with all unspeakable intents filtered out. Checks all other platform intents for having utterances defined. */
  public prepareConfiguration(intentConfigurations: PlatformGenerator.IntentConfiguration[]): PreparedIntentConfiguration[] {
    // Leave out unspeakable Intent
    const withoutUnspeakable = intentConfigurations.filter(config => typeof config.intent === "string" || GenericIntent.isSpeakable(config.intent));

    // Convert all platform intents to apiai strings
    const preparedSet = withoutUnspeakable
      .map(config => {
        return { ...config, intent: typeof config.intent === "string" ? config.intent : genericIntentToApiai[config.intent] };
      })
      .filter(config => typeof config.intent === "string");

    // Leave out all intents without utterances, but tell user about this
    const withoutUndefinedUtterances: PreparedIntentConfiguration[] = [];
    preparedSet.forEach(config => {
      if (typeof config.intent === "string" && (typeof config.utterances === "undefined" || config.utterances.length === 0)) {
        console.warn("You did not specify any utterances for intent: '" + config.intent + "'. This makes this intent not callable. Omitting.");
        if (config.intent.endsWith("GenericIntent")) {
          console.warn(
            config.intent + " is a platform intent without utterances. Update your platform utterances service or specify some utterances on your own."
          );
        }
      } else {
        withoutUndefinedUtterances.push(config);
      }
    });

    // Return result, but also add the "invokeGenericIntent", which acts as a the "default welcome intent"
    return withoutUndefinedUtterances.concat([{ intent: "invokeGenericIntent", entities: [], utterances: [] }]);
  }

  private prepareIntentEvents(intent: string) {
    const events = DialogflowEventStore.getEventsFor(intent);
    if (events && events.length > 0) return events.map(event => ({ name: event }));
    return [];
  }

  /**
   * Create all needed build directories
   */
  private createBuildDirectory() {
    console.log("creating build directory: " + this.currentBuildDir);
    fs.mkdirSync(this.currentBuildDir);
    fs.mkdirSync(this.intentDirectory);
    fs.mkdirSync(this.entitiesDirectory);
  }

  /**
   * Create a bundle.zip file and insert all configuration files
   */
  private createBundleFile() {
    const zip = archiver("zip");
    const output = fs.createWriteStream(this.currentBuildDir + "/bundle.zip");
    zip.pipe(output);
    zip.directory(this.intentDirectory + "/", "intents/");
    zip.directory(this.entitiesDirectory + "/", "entities/");
    zip.file(this.currentBuildDir + "/package.json", { name: "package.json" });
    zip.finalize();
  }

  /**
   * Writes generated intent schema to single definition file
   * @param intent
   */
  private writeIntentAndUtterancesFiles(intent: ReturnType<Generator["buildDefaultIntent"]>) {
    fs.writeFileSync(this.intentDirectory + "/" + intent.intent.name + ".json", JSON.stringify(intent.intent, null, 2));
    if (intent.utterances && intent.utterances.length > 0) {
      fs.writeFileSync(this.intentDirectory + "/" + intent.intent.name + "_usersays_" + this.language + ".json", JSON.stringify(intent.utterances, null, 2));
    }
  }

  /**
   * Writes generated custom entities to entity definition and language specific synonym file
   * @param customEntity
   */
  private writeCustomEntitiesFiles(customEntity) {
    if (typeof customEntity !== "undefined") {
      fs.writeFileSync(this.entitiesDirectory + "/" + customEntity.entity.name + ".json", JSON.stringify(customEntity.entity, null, 2));
      fs.writeFileSync(
        this.entitiesDirectory + "/" + customEntity.entity.name + "_entries_" + this.language + ".json",
        JSON.stringify(customEntity.entries, null, 2)
      );
    }
  }

  private getUnixTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  private makeIntentParameters(
    parameters: string[],
    entityMapping: PlatformGenerator.EntityMapping,
    customEntityMapping: PlatformGenerator.CustomEntityMapping
  ) {
    return parameters.map(name => {
      const parameter = {
        name,
        id: uuid(),
        required: false,
        value: `$${name}`,
        isList: false,
      };
      return { ...parameter, dataType: this.getParameterTypeFor(name, entityMapping, customEntityMapping) };
    });
  }

  private getParameterTypeFor(
    parameterName: string,
    entityMapping: PlatformGenerator.EntityMapping,
    customEntityMapping: PlatformGenerator.CustomEntityMapping
  ) {
    const config = this.component.configuration;

    // Return custom data type
    if (typeof customEntityMapping[entityMapping[parameterName]] !== "undefined" && typeof config.entities[entityMapping[parameterName]] === "undefined") {
      return `@${entityMapping[parameterName]}`;
    }

    if (typeof config.entities === "undefined" || typeof config.entities[entityMapping[parameterName]] === "undefined") {
      throw Error("Missing apiai configured type for entity '" + parameterName + "' (as " + entityMapping[parameterName] + ").");
    }

    // Return platform specific data type
    return config.entities[entityMapping[parameterName]];
  }
}

export interface PreparedIntentConfiguration extends PlatformGenerator.IntentConfiguration {
  intent: string;
}
