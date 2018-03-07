import { State, ResponseFactory } from "assistant-source";
import { injectable, inject } from "inversify";

@injectable()
export class MainState implements State.Required {
  responseFactory: ResponseFactory;

  constructor(@inject("core:unifier:current-response-factory") factory: ResponseFactory) {
    this.responseFactory = factory;
  }

  chatTestIntent() {
    this.responseFactory.createChatResponse().addChatBubble("Bubble 1").addChatBubble("Bubble 2");
    this.responseFactory.createSimpleVoiceResponse().endSessionWith("Hello from api.ai!");
  }

  unhandledGenericIntent() {
    this.responseFactory.createSimpleVoiceResponse().endSessionWith("Hello from api.ai!");
  }

  unansweredGenericIntent() {
    this.responseFactory.createAndSendEmptyResponse();
  }
}