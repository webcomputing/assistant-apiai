export type WebhookState = "WEBHOOK_STATE_UNSPECIFIED" | "WEBHOOK_STATE_ENABLED" | "WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING";

export type TrainingPhraseType = "TYPE_UNSPECIFIED" | "EXAMPLE" | "TEMPLATE";

export type IntentMessagePlatform = "PLATFORM_UNSPECIFIED" | "FACEBOOK" | "SLACK" | "TELEGRAM" | "KIK" | "SKYPE" | "LINE" | "VIBER" | "ACTIONS_ON_GOOGLE";

export type IntentDefaultResponsePlatforms =
  | "PLATFORM_UNSPECIFIED"
  | "FACEBOOK"
  | "SLACK"
  | "TELEGRAM"
  | "KIK"
  | "SKYPE"
  | "LINE"
  | "VIBER"
  | "ACTIONS_ON_GOOGLE";

/**
 * The request body sent to your service is in JSON format
 * @example
 * {
 * "responseId": "string",
 * "session": "string",
 * "queryResult": object
 * "originalDetectIntentRequest": object
 * }
 */
export interface RequestBody {
  /**  Unique id for request */
  responseId: string;
  /** Unique session id */
  session: string;
  /** Result of the conversation query or event processing. */
  queryResult: QueryResult;
  /** Full request coming from an integrated platform. (Google, Facebook Messenger, Slack, etc.) */
  originalDetectIntentRequest: OriginalDetectIntentRequest;
}

export interface QueryResult {
  /** The original text of the query */
  queryText: string;
  /** Consists of parameter_name:parameter_value pairs */
  parameters: {
    [key: string]: any;
  };
  /** Set to false if required parameters are missing in query */
  allRequiredParamsPresent: boolean;
  /** Text to be pronounced to the user or shown on the screen */
  fulfillmentText: string;
  /** Collection of rich messages to show the user. */
  fulfillmentMessages: {
    key: {
      [key: string]: string;
    };
  };
  /** Collection of output contexts */
  outputContexts: Context[];
  /** The intent that matched the user's query */
  intent: Intent;
  /** Matching score for the intent. */
  intentDetectionConfidence: number;
  /** Free-form diagnostic info. */
  diagnosticInfo: {
    [key: string]: any;
  };
  /** The language that was triggered during intent matching. */
  languageCode: string;
}

export interface OriginalDetectIntentRequest {
  /** The source of this request, e.g., google, facebook, slack. It is set by Dialogflow-owned servers. */
  source: string;
  /** Optional. The version of the protocol used for this request. This field is AoG-specific. */
  version?: string;
  /** Optional. This field is set to the value of QueryParameters.payload field passed in the request. */
  payload?: {
    [key: string]: any;
  };
}

export interface Context {
  /**
   * The unique identifier of the context. Format: projects/<Project ID>/agent/sessions/<Session ID>/contexts/<Context ID>,
   * or projects/<Project ID>/agent/environments/<Environment ID>/users/<User ID>/sessions/<Session ID>/contexts/<Context ID>
   */
  name: string;
  /** The number of conversational query requests after which the context expires. If set to 0 (the default) the context expires immediately */
  lifespanCount?: number;
  /** The collection of parameters associated with this context */
  parameters?: {
    key: {
      [key: string]: any;
    };
  };
}

export interface Intent {
  /** Required for all methods except create (create populates the name automatically. The unique identifier of this intent. Format: projects/<Project ID>/agent/intents/<Intent ID> */
  name: string;
  /** Required. The name of this intent */
  displayName: string;
  /** Required. Indicates whether webhooks are enabled for the intent. */
  webhookState: WebhookState;
  /** Optional. The priority of this intent. Higher numbers represent higher priorities. Zero or negative numbers mean that the intent is disabled */
  priority?: number;
  /** Optional. Indicates whether this is a fallback intent. */
  isFallback?: boolean;
  /** Optional. Indicates whether Machine Learning is disabled for the intent. */
  mlDisabled?: boolean;
  /** Optional. The list of context names required for this intent to be triggered. Format: projects/<Project ID>/agent/sessions/-/contexts/<Context ID>. */
  inputContextNames?: string[];
  /** Optional. The collection of event names that trigger the intent. */
  events?: string[];
  /** Optional. The collection of event names that trigger the intent. */
  trainingPhrases?: TrainingPhrase[];
  /** Optional. The name of the action associated with the intent. */
  action?: string;
  /** Optional. The collection of contexts that are activated when the intent is matched. Context messages in this collection should not set the parameters field. */
  outputContexts?: Context[];
  /** Optional. Indicates whether to delete all contexts in the current session when this intent is matched. */
  resetContexts?: boolean;
  /** Optional. The collection of parameters associated with the intent. */
  parameters?: IntentParameter[];
  /** Optional. The collection of rich messages corresponding to the Response field in the Dialogflow console. */
  messages?: IntentMessage[];
  /** Optional. The list of platforms for which the first response will be taken from among the messages assigned to the DEFAULT_PLATFORM. */
  defaultResponsePlatforms?: IntentDefaultResponsePlatforms[];
  /**
   * The unique identifier of the root intent in the chain of followup intents.
   * It identifies the correct followup intents chain for this intent. Format: projects/<Project ID>/agent/intents/<Intent ID>.
   */
  rootFollowupIntentName?: string;
  /**
   * The unique identifier of the parent intent in the chain of followup intents.
   * It identifies the parent followup intent. Format: projects/<Project ID>/agent/intents/<Intent ID>.
   */
  parentFollowupIntentName?: string;
  // Optional. Collection of information about all followup intents that have name of this intent as a root_name.
  followupIntentInfo?: IntentFollowupIntentInfo[];
}

export interface TrainingPhrase {
  /** Required. The unique identifier of this training phrase */
  name: string;
  /** Required. The type of the training phrase */
  type: TrainingPhraseType;
  /** Required. The collection of training phrase parts (can be annotated). Fields: entityType, alias and userDefined should be populated only for the annotated parts of the training phrase. */
  parts: TrainingPhrasePart[];
}

export interface TrainingPhrasePart {
  /** Required. The text corresponding to the example or template, if there are no annotations. For annotated examples, it is the text for one of the example's parts. */
  text: string;
  /** Optional. The entity type name prefixed with @. This field is required for the annotated part of the text and applies only to examples. */
  entityType?: string;
  /** Optional. The parameter name for the value extracted from the annotated part of the example. */
  alias?: string;
  /** Optional. Indicates whether the text was manually annotated by the developer. */
  userDefined?: boolean;
}

export interface IntentParameter {
  /** The unique identifier of this parameter. */
  name: string;
  /** Required. The name of the parameter. */
  displayName: string;
  /** Optional. The definition of the parameter value. */
  value?: string;
  /**
   * Optional. The default value to use when the value yields an empty result.
   * Default values can be extracted from contexts by using the following syntax: #context_name.parameter_name.
   */
  default?: string;
  /** Optional. The name of the entity type, prefixed with @, that describes values of the parameter */
  entityTypeDisplayName?: string;
  /** Optional. Indicates whether the parameter is required. That is, whether the intent cannot be completed without collecting the parameter value. */
  mandatory: boolean;
  /** Optional. The collection of prompts that the agent can present to the user in order to collect value for the parameter. */
  prompts?: string[];
  /** Optional. Indicates whether the parameter represents a list of values. */
  isList: boolean;
}

export interface IntentMessage {
  /** Optional. The platform that this message is intended for. */
  platform?: IntentMessagePlatform;
  /** Union field message. Required. The rich response message. message can be only one of the following fields */
  /** The text response. */
  text?: IntentMessageText;
  /** The image response. */
  image?: IntentMessageImage;
  /** The quick replies response. */
  quickReplies?: IntentMessageQuickReplies;
  /** The card response. */
  card?: IntentMessageCard;
  /** Returns a response containing a custom, platform-specific payload */
  payload?: {
    [key: string]: any;
  };
  /** The voice and text-only responses for Actions on Google. */
  simpleResponses?: IntentMessageSimpleResponses;
  /** The basic card response for Actions on Google. */
  basicCard?: IntentMessageBasicCard;
  /** The suggestion chips for Actions on Google. */
  suggestions?: IntentMessageSuggestions;
  /** The link out suggestion chip for Actions on Google. */
  linkOutSuggestion?: IntentMessageLinkOutSuggestion;
  /** The list card response for Actions on Google. */
  listSelect?: IntentMessageListSelect;
  /** The carousel card response for Actions on Google. */
  carouselSelect?: IntentMessageCarouselSelect;
}

export interface IntentMessageText {
  /** Optional. The collection of the agent's responses. */
  text?: string[];
}

export interface IntentMessageImage {
  /** Optional. The public URI to an image file. */
  imageUri?: string;
  /** Optional. A text description of the image to be used for accessibility, e.g., screen readers. */
  accessibilityText?: string;
}

export interface IntentMessageQuickReplies {
  /** Optional. The title of the collection of quick replies. */
  title?: string;
  /** Optional. The collection of quick replies */
  quickReplies?: string[];
}

export interface IntentMessageCard {
  /** Optional. The title of the card. */
  title?: string;
  /** Optional. The subtitle of the card. */
  subtitle?: string;
  /** Optional. The public URI to an image file for the card. */
  imageUri?: string;
  buttons?: IntentMessageCardButton[];
}

export interface IntentMessageCardButton {
  /**  Optional. The text to show on the button. */
  text?: string;
  /** Optional. The text to send back to the Dialogflow API or a URI to open. */
  postback?: string;
}

export interface IntentMessageSimpleResponses {
  /** The voice and text-only responses for Actions on Google. */
  simpleResponses?: IntentMessageSimpleResponse[];
}

export interface IntentMessageSimpleResponse {
  /** One of textToSpeech or ssml must be provided. The plain text of the speech output. Mutually exclusive with ssml. */
  textToSpeech?: string;
  /** One of textToSpeech or ssml must be provided. Structured spoken response to the user in the SSML format. Mutually exclusive with textToSpeech. */
  ssml?: string;
  /** Optional. The text to display. */
  displayText?: string;
}

export interface IntentMessageBasicCard {
  /** Optional. The title of the card. */
  title?: string;
  /** Optional. The subtitle of the card. */
  subtitle?: string;
  /** Required, unless image is present. The body text of the card. */
  formattedText: string;
  /** Optional. The image for the card. */
  image?: IntentMessageImage;
  /** Optional. The collection of card buttons. */
  buttons?: IntentMessageBasicCardButton[];
}

export interface IntentMessageBasicCardButton {
  /** Required. The title of the button. */
  title: string;
  /** Required. Action to take when a user taps on the button. */
  openUriAction: IntentMessageBasicCardButtonOpenUriAction;
}

export interface IntentMessageBasicCardButtonOpenUriAction {
  /** Required. The HTTP or HTTPS scheme URI. */
  uri: string;
}

export interface IntentMessageSuggestions {
  /** Required. The list of suggested replies. */
  suggestions: IntentMessageSuggestion[];
}

export interface IntentMessageSuggestion {
  /** Required. The text shown the in the suggestion chip. */
  title: string;
}

export interface IntentMessageLinkOutSuggestion {
  /** Required. The name of the app or site this chip is linking to. */
  destinationName: string;
  /** Required. The URI of the app or site to open when the user taps the suggestion chip. */
  uri?: string;
}

export interface IntentMessageListSelect {
  /** Optional. The overall title of the list. */
  title?: string;
  /** Required. List items. */
  items: IntentMessageListSelectItem[];
}

export interface IntentMessageListSelectItem {
  /** Required. Additional information about this option. */
  info: IntentMessageSelectItemInfo;
  /** Required. The title of the list item. */
  title: string;
  /** Optional. The main text describing the item. */
  description?: string;
  /** Optional. The image to display. */
  image?: IntentMessageImage;
}

export interface IntentMessageSelectItemInfo {
  /** Required. A unique key that will be sent back to the agent if this response is given. */
  key: string;
  /** Optional. A list of synonyms that can also be used to trigger this item in dialog. */
  synonyms?: string[];
}

export interface IntentMessageCarouselSelect {
  /** Required. Carousel items. */
  items: IntentMessageCarouselSelectItem[];
}

export interface IntentMessageCarouselSelectItem {
  /** Required. Additional info about the option item. */
  info: IntentMessageSelectItemInfo;
  /** Required. Title of the carousel item. */
  title?: string;
  /** Optional. The body text of the card. */
  description?: string;
  /** Optional. The image to display. */
  image?: IntentMessageImage;
}

export interface IntentFollowupIntentInfo {
  /** The unique identifier of the followup intent */
  followupIntentName?: string;
  /** The unique identifier of the followup intent parent */
  parentFollowupIntentName?: string;
}

/**
 * The response JSON body sent from your service in JSON format
 * @example
 * {
 * "fulfillmentText": "string",
 *  "fulfillmentMessages": object
 *  "source": "string",
 * "payload": object,
 * "followupEventInput": object
 * }
 */

export interface ResponseBody {
  /** Optional. The text to be shown on the screen. This value is passed directly to QueryResult.fulfillment_text. */
  fulfillmentText?: string;
  /**  Optional. The collection of rich messages to present to the user. This value is passed directly to QueryResult.fulfillment_messages. */
  fulfillmentMessages?: IntentMessage[];
  /** Optional. This value is passed directly to QueryResult.webhook_source. */
  source?: string;
  /** Optional. This value is passed directly to QueryResult.webhook_payload */
  payload?: {
    [key: string]: any;
  };
  /** Optional. The collection of output contexts. This value is passed directly to QueryResult.output_contexts. */
  outputContexts?: Context[];
  /** Optional. Makes the platform immediately invoke another sessions.detectIntent call internally with the specified event as input. */
  followupEventInput?: EventInput;
}

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
