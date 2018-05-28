import { RequestExtractor, RequestContext, intent, GenericIntent, Logger, injectionNames, ComponentSpecificLoggerFactory, OptionalExtractions } from "assistant-source";
import { injectable, inject } from "inversify";
import { Component } from "inversify-components";

import { Configuration, COMPONENT_NAME } from "./private-interfaces";
import { Extraction } from "./public-interfaces";
import { apiaiToGenericIntent } from "./intent-dict";

@injectable()
export class Extractor implements RequestExtractor {
  public component: Component;
  private configuration: Configuration.Runtime;
  private logger: Logger;

  constructor(
    @inject("meta:component//apiai") componentMeta: Component<Configuration.Runtime>,
    @inject(injectionNames.componentSpecificLoggerFactory) logFactory: ComponentSpecificLoggerFactory
  ) {
    this.component = componentMeta;
    this.configuration = componentMeta.configuration;
    this.logger = logFactory(COMPONENT_NAME, "root");
  }

  async fits(context: RequestContext): Promise<boolean> {
    this.logger.debug({ requestId: context.id }, "Checking request for dialogflow...");

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
        this.logger.debug({ requestId: context.id }, "Request matched for dialogflow.");
        return true;
      } else {
        this.logger.warn({ requestId: context.id }, "Given headers did not match configured authenticationHeaders. Aborting.");
        return false;
      }
    }
  }

  async extract(context: RequestContext): Promise<Extraction> {
    this.logger.info({ requestId: context.id }, "Extracting dialogflow request.");

    return {
      platform: this.component.name,
      sessionID: this.getSessionID(context),
      intent: this.getIntent(context),
      entities: this.getEntities(context),
      language: this.getLanguage(context),
      spokenText: this.getSpokenText(context),
      additionalParameters: this.getAdditionalParameters(context)
    };
  }

  protected getSessionID(context: RequestContext) {
    return context.body.sessionId;
  }

  protected getIntent(context: RequestContext): intent {
    if (typeof(context.body.result) === "undefined" || typeof(context.body.result.metadata) === "undefined" 
      || typeof(context.body.result.metadata.intentName) !== "string") {
        return GenericIntent.Unhandled;
    }

    let genericIntent = this.getGenericIntent(context);
    if (genericIntent !== null) return genericIntent;

    return context.body.result.metadata.intentName;
  }

  protected getEntities(context: RequestContext) {
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

  protected getLanguage(context: RequestContext): string {
    return context.body.lang;
  }

  /* Returns GenericIntent if request is a GenericIntent, or null, if not */
  protected getGenericIntent(context: RequestContext): GenericIntent | null {
    return Extractor.makeIntentStringToGenericIntent(context.body.result.metadata.intentName);
  }

  protected getSpokenText(context: RequestContext): string {
    return context.body.result.resolvedQuery;
  }

  protected getAdditionalParameters(context: RequestContext): {[args: string]: any} {
    return (context.body &&
    context.body.originalRequest &&
    context.body.originalRequest.data) || {};
  }

  static makeIntentStringToGenericIntent(intent: string): GenericIntent | null {
    return apiaiToGenericIntent.hasOwnProperty(intent) ? apiaiToGenericIntent[intent] : null;
  }
}
