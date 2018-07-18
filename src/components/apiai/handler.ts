import {
  RequestContext,
  ResponseHandlerExtensions,
  injectionNames,
  BasicHandler
  } from "../../../../AssistantJS/dts/assistant-source";
import {
  inject,
  injectable
  } from "inversify";
import { Component, ExecutableExtension } from "inversify-components";
import { Configuration } from "./private-interfaces";
import { ApiAiSpecificTypes, ApiAISpecificHandable } from "./public-interfaces";

@injectable()
export class ApiAiHandler<CustomTypes extends ApiAiSpecificTypes> extends BasicHandler<CustomTypes> implements ApiAISpecificHandable<CustomTypes> {
  specificWhitelist: string[];


  chatBubbles: string[] | null = null;

  configuration: Configuration.Runtime;

  constructor(
    @inject(injectionNames.current.requestContext) extraction: RequestContext,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject("meta:component//apiai") componentMeta: Component<Configuration.Runtime>,
    @inject(injectionNames.current.responseHandlerExtensions) responseHandlerExtensions: ResponseHandlerExtensions<CustomTypes, ApiAISpecificHandable<CustomTypes>>
  ) {
    super(extraction, killSession, responseHandlerExtensions);
    this.configuration = componentMeta.configuration;
  }

  protected getBody(results: Partial<CustomTypes>) {
    let response: { data: {}; speech?: CustomTypes["voiceMessage"]; displayText?: string } = { data: {} };
    if (results.voiceMessage) {
      response.speech = results.voiceMessage;
    }

    // Set "displayText"
    if (this.chatBubbles === null) {
      response.displayText = this.configuration.defaultDisplayIsVoice === true && !results.voiceMessage ? undefined : "";
    } else {
      response.displayText = this.chatBubbles.join(" ");
    }

    return response;
  }
}
