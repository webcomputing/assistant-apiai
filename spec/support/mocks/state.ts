import { BasicHandable, injectionNames, State } from "assistant-source";
import { inject, injectable } from "inversify";
import { ApiAiSpecificHandable, ApiAiSpecificTypes } from "../../../src/assistant-apiai";

@injectable()
export class MainState implements State.Required {
  constructor(@inject(injectionNames.current.responseHandler) private handler: ApiAiSpecificHandable<ApiAiSpecificTypes>) {}

  public chatTestIntent() {
    this.handler.endSessionWith("Hello from api.ai!");
  }

  public unhandledGenericIntent() {
    this.handler.endSessionWith("Hello from api.ai!");
  }

  public async unansweredGenericIntent() {
    await this.handler.send();
  }
}
