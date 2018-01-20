import { unifierInterfaces, rootInterfaces } from "assistant-source";
import { injectable, inject } from "inversify";
import { Component } from "inversify-components";

import { Configuration, Extraction } from "./interfaces";
import { apiaiToGenericIntent } from "./intent-dict";
import { log } from "../../global";

@injectable()
export class Extractor implements unifierInterfaces.RequestConversationExtractor {
  public component: Component;
  private configuration: Configuration;

  constructor(@inject("meta:component//apiai") componentMeta: Component) {
    this.component = componentMeta;
    this.configuration = componentMeta.configuration as Configuration;
  }

  async fits(context: rootInterfaces.RequestContext): Promise<boolean> {
    // 1) Check if request format is o.k.
    if (!(
      context.path === this.configuration.route && 
      typeof context.body !== "undefined" && 
      typeof context.body.sessionId !== "undefined" && 
      typeof context.body.lang !== "undefined" && 
      typeof context.body.result !== "undefined" &&
      typeof context.body.result.resolvedQuery !== "undefined"  
    )) {
      return false;
    }

    // 2) Check if secret header fields are o.k.
    if (typeof this.configuration.authenticationHeaders === "undefined" || Object.keys(this.configuration.authenticationHeaders).length < 1) {
      throw new Error("You did not specify any authenticationHeaders in your assistant-apiai configuration. Since version 0.2, you have to specify "+
        "authentication headers. Check out the assistant-apiai README or the assistant-apiai configuration interface for more information.");
    } else {
      // For each configured header field, check if the given value of this header is equal the configured value
      const headersAreValid = Object.keys(this.configuration.authenticationHeaders).filter(headerKey => 
        context.headers[headerKey] !== this.configuration.authenticationHeaders[headerKey] &&
        context.headers[headerKey.toLowerCase()] !== this.configuration.authenticationHeaders[headerKey] &&
        context.headers[headerKey.toUpperCase()] !== this.configuration.authenticationHeaders[headerKey]
      ).length === 0;

      if (headersAreValid) {
        return true;
      } else {
        log("Given headers did not match configured authenticationHeaders. Aborting.");
        return false;
      }
    }
  }

  async extract(context: rootInterfaces.RequestContext): Promise<Extraction> {
    log("Extracting request on api.ai...");

    return {
      component: this.component,
      sessionID: this.getSessionID(context),
      intent: this.getIntent(context),
      entities: this.getEntities(context),
      language: this.getLanguage(context),
      spokenText: this.getSpokenText(context)
    };
  }

  protected getSessionID(context: rootInterfaces.RequestContext) {
    return "apiai-" + context.body.sessionId;
  }

  protected getIntent(context: rootInterfaces.RequestContext): unifierInterfaces.intent {
    if (typeof(context.body.result) === "undefined" || typeof(context.body.result.metadata) === "undefined" 
      || typeof(context.body.result.metadata.intentName) !== "string") {
        return unifierInterfaces.GenericIntent.Unhandled;
    }

    let genericIntent = this.getGenericIntent(context);
    if (genericIntent !== null) return genericIntent;

    return context.body.result.metadata.intentName;
  }

  protected getEntities(context: rootInterfaces.RequestContext) {
    let request = context.body;
    if (typeof(request.result) !== "undefined") {
      if (typeof(request.result.parameters) !== "undefined") {
        let result = {};
        Object.keys(request.result.parameters).forEach(slotName => {
          if (typeof(request.result.parameters[slotName]) !== "undefined" && request.result.parameters[slotName] !== "")
            result[slotName] = request.result.parameters[slotName];
        });
        return result;
      }
    }

    return {};
  }

  protected getLanguage(context: rootInterfaces.RequestContext): string {
    return context.body.lang;
  }

  /* Returns GenericIntent if request is a GenericIntent, or null, if not */
  protected getGenericIntent(context: rootInterfaces.RequestContext): unifierInterfaces.GenericIntent | null {
    return Extractor.makeIntentStringToGenericIntent(context.body.result.metadata.intentName);
  }

  protected getSpokenText(context: rootInterfaces.RequestContext): string {
    return context.body.result.resolvedQuery;
  }

  static makeIntentStringToGenericIntent(intent: string): unifierInterfaces.GenericIntent | null {
    return apiaiToGenericIntent.hasOwnProperty(intent) ? apiaiToGenericIntent[intent] : null;
  }
}
