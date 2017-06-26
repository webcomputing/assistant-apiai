import { injectable, inject } from "inversify";
import { Component } from "ioc-container";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import * as archiver from "archiver";
import { unifierInterfaces } from "assistant-source";

import { genericIntentToApiai } from "./intent-dict";
import { Configuration } from "./interfaces";

@injectable()
export class Builder implements unifierInterfaces.PlatformGenerator {
  @inject("meta:component//platform:apiai")
  private component: Component;

  execute(language: string, buildDir: string, intentConfigurations: unifierInterfaces.GenerateIntentConfiguration[], parameterMapping: unifierInterfaces.GeneratorEntityMapping) {
    let currentBuildDir = buildDir + "/apiai";
    let intentDirectory = currentBuildDir + "/intents";

    console.log("=============     PROCESSING ON APIAI     ============");
    console.log("Intents: #" + intentConfigurations.length + ", language: " + language);

    console.log("validating...");
    let convertedIntents = this.prepareConfiguration(intentConfigurations);

    console.log("building intents (" + convertedIntents.length + ")...");
    let intents = this.buildIntents(convertedIntents, parameterMapping);
    intents.push(this.buildDefaultIntent());

    console.log("creating build directory: " + currentBuildDir);
    fs.mkdirSync(currentBuildDir);
    fs.mkdirSync(intentDirectory);

    console.log("writing to files...");
    intents.forEach(intent =>  {
      fs.writeFileSync(intentDirectory + "/" + intent.name + ".json", JSON.stringify(intent));
    });

    console.log("writing bundled zip...");
    let zip = archiver("zip");
    let output = fs.createWriteStream(currentBuildDir + "/bundle.zip");
    zip.pipe(output);
    zip.directory(intentDirectory + "/", "intents/");
    zip.finalize();
    console.log("=============          FINISHED.          =============");
  }

  /** Returns Intent Schema for Amazon Alexa Config
   * @param preparedIntentConfiguration: Result of prepareConfiguration()
   */
  buildIntents(preparedIntentConfiguration: PreparedIntentConfiguration[], parameterMapping: unifierInterfaces.GeneratorEntityMapping) {
    return preparedIntentConfiguration.map(config => {
      return {
        id: uuid(),
        name: config.intent,
        userSays: config.utterances.map(utterance => this.buildUtterance(utterance, parameterMapping)),
        auto: true,
        contexts: [],
        responses: [
          {
            resetContexts: false,
            affectedContxts: [],
            parameters: this.makeIntentParameters(config.entities, parameterMapping),
            messages: [{ type: 0, speech: [] }]
          }
        ],
        webhookUsed: true,
        webhookForSlotFilling: false,
        fallbackIntent: false,
        events: []
      };
    });
  }

  /** Returns  */
  buildDefaultIntent(): any {
    return {
      "templates": [],
      "userSays": [],
      "id": uuid(),
      "name": "__unhandled",
      "auto": false,
      "contexts": [],
      "responses": [
        {
          "resetContexts": false,
          "action": "input.unknown",
          "affectedContexts": [],
          "parameters": [],
          "messages": [
            {
              "type": 0,
              "speech": []
            }
          ]
        }
      ],
      "webhookUsed": true,
      "webhookForSlotFilling": false,
      "fallbackIntent": true,
      "events": []
    };
  }

  /** Returns single utterance json for intent schema
   * @param utterance: Utterance string
   * @param parameterMapping: Mapping of parameters
   */
  buildUtterance(utterance: string, parameterMapping: unifierInterfaces.GeneratorEntityMapping) {
    let utteranceData: {}[] = [];
    let utteranceSplits = utterance.split(/\{(\w+)?\}/g).filter((element, index) => index % 2 === 0);
    let utteranceParams = utterance.match(/\{(\w+)?\}/g);

    // Create array ob parameter objects
    let utteranceParamObjects: {}[] = [];
    if (utteranceParams !== null) {
      utteranceParamObjects = utteranceParams.map(parameter => {
        parameter = parameter.replace(/\{|\}/g, "");
        return {
          text: parameter,
          alias: parameter,
          userDefined: true,
          meta: this.getParameterTypeFor(parameter, parameterMapping)
        };
      });
    }

    // Create resulting array in zip style
    for (let i = 0; i < utteranceSplits.length; i++) {
      if (utteranceSplits[i].length > 0) utteranceData.push({ text: utteranceSplits[i] });
      if (typeof(utteranceParamObjects[i]) !== "undefined") utteranceData.push(utteranceParamObjects[i]);
    }

    return {
      id: uuid(),
      count: 0,
      isTemplate: false,
      data: utteranceData
    };
  }

  /** Returns BuildIntentConfiguration[] but with all unspeakable intents filtered out. Checks all other platform intents for having utterances defined. */
  prepareConfiguration(intentConfigurations: unifierInterfaces.GenerateIntentConfiguration[]): PreparedIntentConfiguration[] {
    // Leave out unspeakable Intent
    let withoutUnspeakable = intentConfigurations.filter(config => typeof(config.intent) === "string" || unifierInterfaces.GenericIntent.isSpeakable(config.intent));

    // Convert all platform intents to apiai strings
    let preparedSet = withoutUnspeakable
      .map(config => { return Object.assign(config, { intent: typeof(config.intent) === "string" ? config.intent : genericIntentToApiai[config.intent] }); })
      .filter(config => typeof(config.intent) === "string");

    // Leave out all intents without utterances, but tell user about this
    let withoutUndefinedUtterances: PreparedIntentConfiguration[] = [];
    preparedSet.forEach(config => {
      if (typeof(config.intent) === "string" && (typeof(config.utterances) === "undefined" || config.utterances.length === 0)) {
        console.warn("You did not specify any utterances for intent: '" + config.intent + "'. This makes this intent not callable. Omitting.");
        if (config.intent.endsWith("GenericIntent")) {
          console.warn(config.intent + " is a platform intent without utterances. Update your platform utterances service or specify some utterances on your own.");
        }
      } else {
        withoutUndefinedUtterances.push(config);
      }
    });

    return withoutUndefinedUtterances;
  }

  private makeIntentParameters(parameters: string[], parameterMapping: unifierInterfaces.GeneratorEntityMapping): { name: string, dataType: string, value: string }[] {
    return parameters.map(name => {
      return { name: name, dataType: this.getParameterTypeFor(name, parameterMapping), value: "$" + name };
    });
  }

  private getParameterTypeFor(parameterName: string, parameterMapping: unifierInterfaces.GeneratorEntityMapping) {
    let config = this.component.configuration as Configuration;

    if (typeof(config.entities) === "undefined" || typeof(config.entities[parameterMapping[parameterName]]) === "undefined")
      throw Error("Missing apiai configured type for entity '" + parameterName + "' (as " + parameterMapping[parameterName] + ").");

    return config.entities[parameterMapping[parameterName]];
  }
}

export interface PreparedIntentConfiguration extends unifierInterfaces.GenerateIntentConfiguration {
  intent: string;
}