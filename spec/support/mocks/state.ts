import { State, injectionNames, BasicHandable } from "../../../../AssistantJS/dts/assistant-source";
import { inject, injectable } from "../../../../AssistantJS/node_modules/inversify";
import { ApiAiSpecificTypes, ApiAISpecificHandable } from "../../../src/assistant-apiai";

@injectable()
export class MainState implements State.Required {
  constructor(@inject(injectionNames.current.responseHandler) private handler: ApiAISpecificHandable<ApiAiSpecificTypes>) {}

  chatTestIntent() {
    this.handler.setChatBubbles(["Bubble 1", "Bubble 2"]).endSessionWith("Hello from api.ai!");
  }

  unhandledGenericIntent() {
    this.handler.endSessionWith("Hello from api.ai!");
  }

  async unansweredGenericIntent() {
    await this.handler.send();
  }
}
