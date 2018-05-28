import {
  AbstractResponseHandler,
  RequestContext,
  ResponseCallback,
  ResponseHandlerExtensions
  } from "assistant-source";
import {
  inject,
  injectable,
  multiInject,
  optional
  } from "inversify";
import { Component, ExecutableExtension } from "inversify-components";
import { Configuration } from "./private-interfaces";
import { HandlerInterface } from "./public-interfaces";

@injectable()
export class ApiAiHandle extends AbstractResponseHandler implements HandlerInterface {
  chatBubbles: string[] | null = null;
  responseCallback: ResponseCallback;
  killSession: () => Promise<void>;
  configuration: Configuration.Runtime;
  
  constructor(
    @inject("core:root:current-request-context") extraction: RequestContext,
    @inject("core:unifier:current-kill-session-promise") killSession: () => Promise<void>,
    @inject("meta:component//apiai") componentMeta: Component<Configuration.Runtime>,
    @inject("core:unifier:response-handler-extensions") responseHandlerExtensions: ResponseHandlerExtensions
  ) {
    super(extraction, killSession, responseHandlerExtensions);
    this.configuration = componentMeta.configuration;
  }

  getBody() {
    let response: { data: {}, speech?: string, displayText?: string } = { data: {} };
    if (this.voiceMessage !== null && this.voiceMessage !== "") {
      response.speech = this.voiceMessage;
    }

    // Set "displayText"
    if (this.chatBubbles === null) {
      response.displayText = this.configuration.defaultDisplayIsVoice === true && this.voiceMessage !== null ? undefined : "";
    } else {
      response.displayText = this.chatBubbles.join(" ");
    }

    return response;
  }
}