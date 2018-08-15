import { ComponentSpecificLoggerFactory, GenericIntent, injectionNames, intent, Logger, RequestExtractor } from "assistant-source";
import { inject, injectable } from "inversify";
import { Component } from "inversify-components";
import { apiaiToGenericIntent } from "./intent-dict";
import { COMPONENT_NAME, Configuration } from "./private-interfaces";
import { DialogflowRequestContext, ExtractionInterface } from "./public-interfaces";

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

  public async fits(context: DialogflowRequestContext): Promise<boolean> {
    this.logger.debug({ requestId: context.id }, "Checking request for dialogflow...");

    // 1) Check if request format is o.k.
    if (
      !(
        context.path === this.configuration.route &&
        typeof context.body !== "undefined" &&
        typeof context.body.session !== "undefined" &&
        typeof context.body.queryResult !== "undefined" &&
        typeof context.body.queryResult.queryText !== "undefined"
      )
    ) {
      return false;
    }

    // 2) Check if secret header fields are o.k.
    if (typeof this.configuration.authenticationHeaders === "undefined" || Object.keys(this.configuration.authenticationHeaders).length < 1) {
      throw new Error(
        "You did not specify any authenticationHeaders in your assistant-apiai configuration. Since version 0.2, you have to specify " +
          "authentication headers. Check out the assistant-apiai README or the assistant-apiai configuration interface for more information."
      );
    } else {
      // For each configured header field, check if the given value of this header is equal the configured value
      const headersAreValid =
        Object.keys(this.configuration.authenticationHeaders).filter(
          headerKey =>
            context.headers[headerKey] !== this.configuration.authenticationHeaders[headerKey] &&
            context.headers[headerKey.toLowerCase()] !== this.configuration.authenticationHeaders[headerKey] &&
            context.headers[headerKey.toUpperCase()] !== this.configuration.authenticationHeaders[headerKey]
        ).length === 0;

      if (headersAreValid) {
        this.logger.debug({ requestId: context.id }, "Request matched for dialogflow.");
        return true;
      }

      this.logger.warn({ requestId: context.id }, "Given headers did not match configured authenticationHeaders. Aborting.");
      return false;
    }
  }

  public async extract(context: DialogflowRequestContext): Promise<ExtractionInterface> {
    this.logger.info({ requestId: context.id }, "Extracting dialogflow request.");

    return {
      platform: this.component.name,
      sessionID: this.getSessionID(context),
      intent: this.getIntent(context),
      entities: this.getEntities(context),
      language: this.getLanguage(context),
      spokenText: this.getSpokenText(context),
      additionalParameters: this.getAdditionalParameters(context),
    };
  }

  protected getSessionID(context: DialogflowRequestContext) {
    return context.body.session;
  }

  protected getIntent(context: DialogflowRequestContext): intent {
    if (
      typeof context.body.queryResult === "undefined" ||
      typeof context.body.queryResult.intent === "undefined" ||
      typeof context.body.queryResult.intent.displayName !== "string" ||
      context.body.queryResult.intent.displayName === "__unhandled"
    ) {
      return GenericIntent.Unhandled;
    }

    const genericIntent = this.getGenericIntent(context);
    if (genericIntent !== null) return genericIntent;

    return context.body.queryResult.intent.displayName;
  }

  protected getEntities(context: DialogflowRequestContext) {
    const request = context.body;
    if (typeof request.queryResult !== "undefined") {
      if (typeof request.queryResult.parameters !== "undefined") {
        const result = {};
        Object.keys(request.queryResult.parameters).forEach(slotName => {
          if (typeof request.queryResult.parameters[slotName] !== "undefined" && request.queryResult.parameters[slotName] !== "") {
            result[slotName] = request.queryResult.parameters[slotName];
          }
        });
        return result;
      }
    }

    return {};
  }

  protected getLanguage(context: DialogflowRequestContext): string {
    return context.body.queryResult.languageCode;
  }

  /* Returns GenericIntent if request is a GenericIntent, or null, if not */
  protected getGenericIntent(context: DialogflowRequestContext): GenericIntent | null {
    return Extractor.makeIntentStringToGenericIntent(context.body.queryResult.intent.displayName);
  }

  protected getSpokenText(context: DialogflowRequestContext): string {
    return context.body.queryResult.queryText;
  }

  protected getAdditionalParameters(context: DialogflowRequestContext): { [args: string]: any } {
    return (context.body && context.body.originalDetectIntentRequest && context.body.originalDetectIntentRequest.payload) || {};
  }

  public static makeIntentStringToGenericIntent(intentName: string): GenericIntent | null {
    return apiaiToGenericIntent.hasOwnProperty(intentName) ? apiaiToGenericIntent[intentName] : null;
  }
}
