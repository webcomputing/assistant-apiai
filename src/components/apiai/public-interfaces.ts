import {
  MinimalRequestExtraction,
  MinimalResponseHandler,
  OptionalExtractions,
  OptionalHandlerFeatures
  } from "assistant-source";
import { Configuration } from "./private-interfaces";

/** Configuration of apiai component */
export interface ApiaiConfiguration extends Partial<Configuration.Defaults>, Configuration.Required {};

/** Property describing the configuration of the apiai component */
export interface ApiaiConfigurationAttribute {
  "apiai": ApiaiConfiguration;
}

export interface Extraction extends 
  MinimalRequestExtraction,
  OptionalExtractions.Timestamp,
  OptionalExtractions.SpokenText { }

export interface HandlerInterface extends
  MinimalResponseHandler,
  OptionalHandlerFeatures.GUI.ChatBubbles {
    getBody(): {
      data: any;
      speech?: string;
      displayText?: string;
    };
  }