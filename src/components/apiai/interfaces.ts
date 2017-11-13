import { unifierInterfaces } from "assistant-source";

export interface OptionalConfiguration {
  /** Route for api.ai requests, default: '/apiai */
  route?: string;

  /** Entitiy configuration for api.ai, default: {} */
  entities?: { [name: string]: string };

  /** If set to true and if there is no chat bubble text, "displayText" will be set to the voiceResponse, default: true */
  defaultDisplayIsVoice?: boolean;
};

export interface Configuration extends OptionalConfiguration {
  /** 
   * List of header key/value-pairs which have to be present in an dialogflow request. 
   * assistant-apiai checks if all headers are present and contain the respective value.
   * To configure, go to the "fulfillment" tab in your dialogflow console and add some secret header keys and (complex) values. 
   * After that, add them to this object, for example: {"myFirstSecretHeader": "myVerySecretValue", "mySecondSecretHeader": "mySecondVerySecretValue"}.
   * That way, you are able to verify that an incomming request was really sent by your dialogflow agent.
   */
  authenticationHeaders: { [name: string]: string };
};

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