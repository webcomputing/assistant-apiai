import { inject, injectable } from "inversify";
import { ExecutableExtension, Component } from "inversify-components";
import { unifierInterfaces, rootInterfaces, AbstractResponseHandler } from "assistant-source"
import { HandlerInterface, Configuration } from "./interfaces";
import { log } from "../../global";

@injectable()
export class ApiAiHandle extends AbstractResponseHandler implements HandlerInterface {
  chatBubbles: string[] | null = null;
  responseCallback: rootInterfaces.ResponseCallback;
  killSession: () => Promise<void>;
  configuration: Configuration;
  
  constructor(
    @inject("core:root:current-request-context") extraction: rootInterfaces.RequestContext,
    @inject("core:unifier:current-kill-session-promise") killSession: () => Promise<void>,
    @inject("meta:component//apiai") componentMeta: Component
  ) {
    super(extraction, killSession);
    this.configuration = componentMeta.configuration;
  }

  getBody() {
    let response: { data: {}, speech?: string, displayText?: string } = { data: {} };
    if (this.voiceMessage !== null && this.voiceMessage !== "") {
      response.speech = this.voiceMessage;
    }

    // Set "displayText"
    if (this.chatBubbles === null) {
      response.displayText = this.configuration.defaultDisplayIsVoice === true && this.voiceMessage !== null ? this.voiceMessage : "";
    } else {
      response.displayText = this.chatBubbles.join(" ");
    }

    return response;
  }
}