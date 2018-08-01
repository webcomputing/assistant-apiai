import { BasicAnswerTypes, BasicHandable, MinimalRequestExtraction, OptionalExtractions, RequestContext } from "assistant-source";
import { Configuration } from "./private-interfaces";
import * as DialogflowInterface from "./webhook-interface";

/** Configuration of apiai component */
export interface ApiaiConfiguration extends Partial<Configuration.Defaults>, Configuration.Required {}

/** Property describing the configuration of the apiai component */
export interface ApiaiConfigurationAttribute {
  apiai: ApiaiConfiguration;
}

export interface ExtractionInterface extends MinimalRequestExtraction, OptionalExtractions.SpokenText, OptionalExtractions.AdditionalParameters {}

/**
 * Add custom types here
 */
export interface ApiAiSpecificTypes extends BasicAnswerTypes {}

/**
 * Add custom methods for here
 */
export interface ApiAiSpecificHandable<CustomTypes extends ApiAiSpecificTypes> extends BasicHandable<CustomTypes> {}

export interface DialogflowRequestContext extends RequestContext {
  body: DialogflowInterface.WebhookRequest<any>;
}

export { DialogflowInterface };
