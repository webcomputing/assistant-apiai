import { injectable, inject } from "inversify";
import { Component } from "inversify-components";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import * as archiver from "archiver";
import { PlatformGenerator, GenericIntent } from "assistant-source";

import { genericIntentToApiai } from "./intent-dict";
import { Configuration } from "./private-interfaces";

@injectable()
export class Builder implements PlatformGenerator.Extension {
  @inject("meta:component//apiai")
  private component: Component<Configuration.Runtime>;

  execute(language: string, buildDir: string, intentConfigurations: PlatformGenerator.IntentConfiguration[], parameterMapping: PlatformGenerator.EntityMapping) {
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
      fs.writeFileSync(intentDirectory + "/" + intent.intent.name + ".json", JSON.stringify(intent.intent, null, 2));
      if(intent.utterances && intent.utterances.length > 0) {
        fs.writeFileSync(intentDirectory + "/" + intent.intent.name + "_usersays_"+ language + ".json", JSON.stringify(intent.utterances, null, 2));
      }
    });
    this.writePackageJSON(currentBuildDir)


    console.log("writing bundled zip...");
    let zip = archiver("zip");
    let output = fs.createWriteStream(currentBuildDir + "/bundle.zip");
    zip.pipe(output);
    zip.directory(intentDirectory + "/", "intents/");
    zip.file(currentBuildDir+"/package.json", { name: 'package.json' });
    zip.finalize();
    console.log("=============          FINISHED.          =============");
  }
  
  /** Returns Intent Schema for Amazon Alexa Config
   * @param preparedIntentConfiguration: Result of prepareConfiguration()
   */
  buildIntents(preparedIntentConfiguration: PreparedIntentConfiguration[], parameterMapping: PlatformGenerator.EntityMapping) {
    return preparedIntentConfiguration.map(config => {
      const intent =  {
        id: uuid(),
        name: config.intent,
        auto: true,
        contexts: [],
        responses: [
          {
            resetContexts: false,
            affectedContexts: [],
            parameters: this.makeIntentParameters(config.entities, parameterMapping),
            messages: [{ type: 0, lang: "en", speech: [] }],
            defaultResponsePlatforms: {},
            speech: []
          }
        ],
        priority: 500000,
        webhookUsed: true,
        webhookForSlotFilling: false,
        lastUpdate: this.getUnixTime(),
        fallbackIntent: false,
        events: []
      };

      const utterances = config.utterances.map(utterance => this.buildUtterance(utterance, parameterMapping));

      const result = {intent, utterances}
      return result;
    });
  }

  private getUnixTime(){
    return Math.floor(new Date().getTime()/1000);
  }

  /**
   * Write necessary package.json with version into folder
   */
  writePackageJSON(currentBuildDir: string){
    fs.writeFileSync(currentBuildDir + "/package.json", JSON.stringify({version: "1.0.0"}, null, 2));
  }

  /** Returns  */
  buildDefaultIntent(): any {
    const intent = {
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

    const utterances = [];

    const result = {
      intent, utterances
    }
    return result;
  }

  /** Returns single utterance json for intent schema
   * @param utterance: Utterance string
   * @param parameterMapping: Mapping of parameters
   */
  buildUtterance(utterance: string, parameterMapping: PlatformGenerator.EntityMapping) {
    let utteranceData: {}[] = [];
    let utteranceSplits = utterance.split(/\{[A-Za-z0-9_äÄöÖüÜß]+?\|[A-Za-z0-9_äÄöÖüÜß]+?\}/g);
    let utteranceParams = utterance.match(/\{([A-Za-z0-9_äÄöÖüÜß]+)?\|([A-Za-z0-9_äÄöÖüÜß]+)?\}/g);


    // Create array ob parameter objects
    let utteranceParamObjects: {text:string, alias: string, userDefined: boolean, meta: string}[] = [];
    if (utteranceParams !== null) {
      utteranceParamObjects = utteranceParams.map(parameter => {
        const parameterText = parameter.replace(/\{|\|([A-Za-z0-9_äÄöÖüÜß]+)\}/g, "");
        parameter = parameter.replace(/\{([A-Za-z0-9_äÄöÖüÜß]+)\||\}/g, "");
        return {
          text: parameterText,
          alias: parameter,
          userDefined: true,
          meta: this.getParameterTypeFor(parameter, parameterMapping)
        };
      });
    }

    // Create resulting array in zip style
    for (let i = 0; i < utteranceSplits.length; i++) {
      if (utteranceSplits[i].length > 0){
        utteranceData.push({ text: utteranceSplits[i], userDefined: false });
      } 
      if (typeof(utteranceParamObjects[i]) !== "undefined"){
        utteranceData.push(utteranceParamObjects[i]);
      } 
    }

    return {
      id: uuid(),
      data: utteranceData,
      isTemplate: false,
      count: 0,
      updated: this.getUnixTime()
    };
  }

  /** Returns BuildIntentConfiguration[] but with all unspeakable intents filtered out. Checks all other platform intents for having utterances defined. */
  prepareConfiguration(intentConfigurations: PlatformGenerator.IntentConfiguration[]): PreparedIntentConfiguration[] {
    // Leave out unspeakable Intent
    let withoutUnspeakable = intentConfigurations.filter(config => typeof(config.intent) === "string" || GenericIntent.isSpeakable(config.intent));

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

    // Return result, but also add the "invokeGenericIntent", which acts as a the "default welcome intent"
    return withoutUndefinedUtterances.concat([ { intent: "invokeGenericIntent", entities: [], utterances: [], entitySets: {} } ]);
  }

  private makeIntentParameters(parameters: string[], parameterMapping: PlatformGenerator.EntityMapping): { name: string, dataType: string, value: string, isList: boolean }[] {
    return parameters.map(name => {
      return { name: name, dataType: this.getParameterTypeFor(name, parameterMapping), value: "$" + name, isList: false };
    });
  }

  private getParameterTypeFor(parameterName: string, parameterMapping: PlatformGenerator.EntityMapping) {
    let config = this.component.configuration;

    if (typeof(config.entities) === "undefined" || typeof(config.entities[parameterMapping[parameterName]]) === "undefined")
      throw Error("Missing apiai configured type for entity '" + parameterName + "' (as " + parameterMapping[parameterName] + ").");

    return config.entities[parameterMapping[parameterName]];
  }
}

export interface PreparedIntentConfiguration extends PlatformGenerator.IntentConfiguration {
  intent: string;
}