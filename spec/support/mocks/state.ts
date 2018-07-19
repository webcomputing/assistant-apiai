import { ResponseFactory, State, injectionNames } from "assistant-source";
import { inject, injectable } from "inversify";

@injectable()
export class MainState implements State.Required {
  responseFactory: ResponseFactory;

  constructor(@inject(injectionNames.current.responseFactory) factory: ResponseFactory) {
    this.responseFactory = factory;
  }

  chatTestIntent() {
    this.responseFactory.createSimpleVoiceResponse().endSessionWith("Hello from api.ai!");
  }

  unhandledGenericIntent() {
    this.responseFactory.createSimpleVoiceResponse().endSessionWith("Hello from api.ai!");
  }

  unansweredGenericIntent() {
    this.responseFactory.createAndSendEmptyResponse();
  }
}
