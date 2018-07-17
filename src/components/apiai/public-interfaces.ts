import {
  MinimalRequestExtraction,
  MinimalResponseHandler,
  OptionalExtractions,
  OptionalHandlerFeatures,
  RequestContext
  } from "assistant-source";
import { Configuration } from "./private-interfaces";
import * as webhookInterface from "./webhook-interface";

/** Configuration of apiai component */
export interface ApiaiConfiguration extends Partial<Configuration.Defaults>, Configuration.Required {}

/** Property describing the configuration of the apiai component */
export interface ApiaiConfigurationAttribute {
  apiai: ApiaiConfiguration;
}

export interface ExtractionInterface
  extends MinimalRequestExtraction,
    OptionalExtractions.SpokenText,
    OptionalExtractions.AdditionalParameters {}

export interface HandlerInterface extends MinimalResponseHandler, OptionalHandlerFeatures.GUI.ChatBubbles {
  getBody(): {
    data: any;
    speech?: string;
    displayText?: string;
  };
}

export interface DialogflowRequestContext extends RequestContext {
  body: webhookInterface.RequestBody
}

export { webhookInterface }
