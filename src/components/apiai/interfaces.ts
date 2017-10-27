import { unifierInterfaces } from "assistant-source";

export interface OptionalConfiguration {
  /** Route for api.ai requests, default: '/apiai */
  route?: string;

  /** Entitiy configuration for api.ai, default: {} */
  entities?: { [name: string]: string };

  /** If set to true and if there is no chat bubble text, "displayText" will be set to the voiceResponse, default: true */
  defaultDisplayIsVoice?: boolean;
};

export interface Configuration extends OptionalConfiguration {};

export interface Extraction extends 
  unifierInterfaces.MinimalRequestExtraction,
  unifierInterfaces.OptionalExtractions.SpokenTextExtraction {}

export interface HandlerInterface extends
  unifierInterfaces.MinimalResponseHandler,
  unifierInterfaces.OptionalHandlerFeatures.GUI.ChatBubble {
    getBody(): {
      data: any;
      speech?: string;
      displayText?: string;
    };
  }