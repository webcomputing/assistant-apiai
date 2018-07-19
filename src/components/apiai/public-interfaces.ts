import {
  MinimalRequestExtraction,
  MinimalResponseHandler,
  OptionalExtractions,
  OptionalHandlerFeatures,
  RequestContext
  } from "assistant-source";
import { Configuration } from "./private-interfaces";
import * as DialogflowInterface from "./dialogflow-interface";

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

export interface HandlerInterface extends MinimalResponseHandler {}

export interface DialogflowRequestContext extends RequestContext {
  body: DialogflowInterface.RequestBody
}

export { DialogflowInterface }
