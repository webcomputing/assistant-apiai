import { Context, IntentMessage } from "./common";

/**
 * The response JSON body sent from AssistantJS to Dialogflow
 * @example
 * {
 * "fulfillmentText": "string",
 *  "fulfillmentMessages": object
 *  "source": "string",
 * "payload": object,
 * "followupEventInput": object
 * }
 */
export interface WebhookResponse<Payload extends KeyValue> {
  /** Optional. The text to be shown on the screen. This value is passed directly to QueryResult.fulfillment_text. */
  fulfillmentText?: string;
  /**  Optional. The collection of rich messages to present to the user. This value is passed directly to QueryResult.fulfillment_messages. */
  fulfillmentMessages?: IntentMessage[];
  /** Optional. This value is passed directly to QueryResult.webhook_source. */
  source?: string;
  /** Optional. This value is passed directly to QueryResult.webhook_payload */
  payload?: Payload;
  /** Optional. The collection of output contexts. This value is passed directly to QueryResult.output_contexts. */
  outputContexts?: Context[];
  /** Optional. Makes the platform immediately invoke another sessions.detectIntent call internally with the specified event as input. */
  followupEventInput?: EventInput;
}

/**
 * Interface for key-value-pairs
 */
export interface KeyValue {
  [key: string]: any;
}

/**
 * Makes the platform immediately invoke another sessions.detectIntent call internally with the specified event as input.
 */
export interface EventInput {
  /** Name of the event */
  name?: string;
  /** Consists of parameter_name:parameter_value pairs */
  parameters?: {
    [key: string]: any;
  };
  /** The language that was triggered during event */
  languageCode?: string;
}
