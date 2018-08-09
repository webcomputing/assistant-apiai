/**
 * Represents different platforms that a rich message can be intended for.
 */
export type IntentMessagePlatform = "PLATFORM_UNSPECIFIED" | "FACEBOOK" | "SLACK" | "TELEGRAM" | "KIK" | "SKYPE" | "LINE" | "VIBER" | "ACTIONS_ON_GOOGLE";

/**
 * The collection of rich messages corresponding to the Response field in the Dialogflow console.
 */
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

/**
 * The text response message.
 */
export interface IntentMessageText {
  /** Optional. The collection of the agent's responses. */
  text?: string[];
}

/**
 * The image response message.
 */
export interface IntentMessageImage {
  /** Optional. The public URI to an image file. */
  imageUri?: string;
  /** Optional. A text description of the image to be used for accessibility, e.g., screen readers. */
  accessibilityText?: string;
}

/**
 * The quick replies response message.
 */
export interface IntentMessageQuickReplies {
  /** Optional. The title of the collection of quick replies. */
  title?: string;
  /** Optional. The collection of quick replies */
  quickReplies?: string[];
}

/**
 * The card response message.
 */
export interface IntentMessageCard {
  /** Optional. The title of the card. */
  title?: string;
  /** Optional. The subtitle of the card. */
  subtitle?: string;
  /** Optional. The public URI to an image file for the card. */
  imageUri?: string;
  buttons?: IntentMessageCardButton[];
}

/**
 * Optional. Contains information about a button.
 */
export interface IntentMessageCardButton {
  /**  Optional. The text to show on the button. */
  text?: string;
  /** Optional. The text to send back to the Dialogflow API or a URI to open. */
  postback?: string;
}

/**
 * The collection of simple response candidates.
 * This message in QueryResult.fulfillment_messages and WebhookResponse.fulfillment_messages should contain only one SimpleResponse.
 */
export interface IntentMessageSimpleResponses {
  /** The voice and text-only responses for Actions on Google. */
  simpleResponses?: IntentMessageSimpleResponse[];
}

/**
 * The simple response message containing speech or text.
 */
export interface IntentMessageSimpleResponse {
  /** One of textToSpeech or ssml must be provided. The plain text of the speech output. Mutually exclusive with ssml. */
  textToSpeech?: string;
  /** One of textToSpeech or ssml must be provided. Structured spoken response to the user in the SSML format. Mutually exclusive with textToSpeech. */
  ssml?: string;
  /** Optional. The text to display. */
  displayText?: string;
}

/**
 * The basic card message. Useful for displaying information.
 */
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

/**
 * The button object that appears at the bottom of a card.
 */
export interface IntentMessageBasicCardButton {
  /** Required. The title of the button. */
  title: string;
  /** Required. Action to take when a user taps on the button. */
  openUriAction: IntentMessageBasicCardButtonOpenUriAction;
}

/**
 * Opens the given URI.
 */
export interface IntentMessageBasicCardButtonOpenUriAction {
  /** Required. The HTTP or HTTPS scheme URI. */
  uri: string;
}

/**
 * The collection of suggestions.
 */
export interface IntentMessageSuggestions {
  /** Required. The list of suggested replies. */
  suggestions: IntentMessageSuggestion[];
}

/**
 * The suggestion chip message that the user can tap to quickly post a reply to the conversation.
 */
export interface IntentMessageSuggestion {
  /** Required. The text shown the in the suggestion chip. */
  title: string;
}

/**
 * The suggestion chip message that allows the user to jump out to the app or website associated with this agent.
 */
export interface IntentMessageLinkOutSuggestion {
  /** Required. The name of the app or site this chip is linking to. */
  destinationName: string;
  /** Required. The URI of the app or site to open when the user taps the suggestion chip. */
  uri?: string;
}

/**
 * The card for presenting a list of options to select from.
 */
export interface IntentMessageListSelect {
  /** Optional. The overall title of the list. */
  title?: string;
  /** Required. List items. */
  items: IntentMessageListSelectItem[];
}

/**
 * An item in the list.
 */
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

/**
 * Additional info about the select item for when it is triggered in a dialog.
 */
export interface IntentMessageSelectItemInfo {
  /** Required. A unique key that will be sent back to the agent if this response is given. */
  key: string;
  /** Optional. A list of synonyms that can also be used to trigger this item in dialog. */
  synonyms?: string[];
}

/**
 * The card for presenting a carousel of options to select from.
 */
export interface IntentMessageCarouselSelect {
  /** Required. Carousel items. */
  items: IntentMessageCarouselSelectItem[];
}

/**
 * An item in the carousel.
 */
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

/**
 * Current context of a user's request.
 * This is helpful for differentiating phrases which may be vague or have
 * different meanings depending on the user’s preferences, geographic location, the current page in an app, or the topic of conversation.
 */
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
