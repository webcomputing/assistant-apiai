export type IntentMessagePlatform = "PLATFORM_UNSPECIFIED" | "FACEBOOK" | "SLACK" | "TELEGRAM" | "KIK" | "SKYPE" | "LINE" | "VIBER" | "ACTIONS_ON_GOOGLE";

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
