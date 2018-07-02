import {
  AbstractResponseHandler,
  RequestContext,
  ResponseCallback,
  ResponseHandlerExtensions,
  injectionNames
  } from "assistant-source";
import {
  inject,
  injectable
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
    @inject(injectionNames.current.requestContext) extraction: RequestContext,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject("meta:component//apiai") componentMeta: Component<Configuration.Runtime>,
    @inject(injectionNames.current.responseHandlerExtensions) responseHandlerExtensions: ResponseHandlerExtensions
  ) {
    super(extraction, killSession, responseHandlerExtensions);
    this.configuration = componentMeta.configuration;
  }

  getBody() {
    let response: { data: {}; speech?: string; displayText?: string } = { data: {} };
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
