import {
  MinimalRequestExtraction,
  OptionalExtractions,
  BasicAnswerTypes,
  BasicHandable
  } from "../../../../AssistantJS/dts/assistant-source";
import { Configuration } from "./private-interfaces";

/** Configuration of apiai component */
export interface ApiaiConfiguration extends Partial<Configuration.Defaults>, Configuration.Required {}

/** Property describing the configuration of the apiai component */
export interface ApiaiConfigurationAttribute {
  apiai: ApiaiConfiguration;
}

export interface Extraction
  extends MinimalRequestExtraction,
    OptionalExtractions.SpokenText,
    OptionalExtractions.Timestamp,
    OptionalExtractions.AdditionalParameters {}

/**
 * Add custom types here
 */
export interface ApiAiSpecificTypes extends BasicAnswerTypes {}

/**
 * Add custom methods for here
 */
export interface ApiAISpecificHandable<CustomTypes extends ApiAiSpecificTypes> extends BasicHandable<ApiAiSpecificTypes>{}
