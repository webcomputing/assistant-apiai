export namespace Configuration {
  /** Configuration defaults -> all of these keys are optional for user */
  export interface Defaults {
    /** Route for api.ai requests, default: '/apiai */
    route: string;

    /** Entitiy configuration for api.ai, default: {} */
    entities: { [name: string]: string };

    /** If set to true and if there is no chat bubble text, "displayText" will be set to the voiceResponse, default: true */
    defaultDisplayIsVoice: boolean;

    /** Set the language api.ai should use by default.  default: "en" */
    defaultLanguage: string;
  }

  /** Required configuration options, no defaults are used here */
  export interface Required {
    /**
     * List of header key/value-pairs which have to be present in an dialogflow request.
     * assistant-apiai checks if all headers are present and contain the respective value.
     * To configure, go to the "fulfillment" tab in your dialogflow console and add some secret header keys and (complex) values.
     * After that, add them to this object, for example: {"myFirstSecretHeader": "myVerySecretValue", "mySecondSecretHeader": "mySecondVerySecretValue"}.
     * That way, you are able to verify that an incomming request was really sent by your dialogflow agent.
     */
    authenticationHeaders: { [name: string]: string };
  }

  /** Available configuration settings in a runtime application */
  export interface Runtime extends Defaults, Required {}
}

export interface Entity {
  id: string;
  name: string;
  isOverridable: boolean;
  isEnum: boolean;
  automatedExpansion: boolean;
}

/** Name of component */
export const COMPONENT_NAME = "apiai";
