import { inject, injectable } from "inversify";
import { ExecutableExtension, Component } from "inversify-components";
import { AbstractResponseHandler, ResponseCallback, RequestContext } from "assistant-source"
import { HandlerInterface } from "./public-interfaces";
import { Configuration } from "./private-interfaces";

@injectable()
export class ApiAiHandle extends AbstractResponseHandler implements HandlerInterface {
  chatBubbles: string[] | null = null;
  responseCallback: ResponseCallback;
  killSession: () => Promise<void>;
  configuration: Configuration.Runtime;
  
  constructor(
    @inject("core:root:current-request-context") extraction: RequestContext,
    @inject("core:unifier:current-kill-session-promise") killSession: () => Promise<void>,
    @inject("meta:component//apiai") componentMeta: Component<Configuration.Runtime>
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
      response.displayText = this.configuration.defaultDisplayIsVoice === true && this.voiceMessage !== null ? undefined : "";
    } else {
      response.displayText = this.chatBubbles.join(" ");
    }

    return response;
  }
}