import { inject, injectable } from "inversify";
import { ExecutableExtension } from "inversify-components";
import { unifierInterfaces, rootInterfaces, AbstractResponseHandler } from "assistant-source"
import { HandlerInterface } from "./interfaces";
import { log } from "../../global";

@injectable()
export class ApiAiHandle extends AbstractResponseHandler implements HandlerInterface {
  responseCallback: rootInterfaces.ResponseCallback;
  endSessionExecuter: Function;
  
  constructor(
    @inject("core:root:current-request-context") extraction: rootInterfaces.RequestContext,
    @inject("core:unifier:end-session-callbacks-executer") endSessionExecuter: Function
  ) {
    super(extraction, endSessionExecuter);
  }

  getBody() {
    let response = this.getBaseBody();
    if (this.voiceMessage !== null && this.voiceMessage !== "") {
      response.speech = this.voiceMessage;
      response.displayText = this.voiceMessage;
    }

    log("Responding with ", response);

    return response;
  }

  protected getBaseBody(): any {
    return {
      data: {
        response: {
          shouldEndSession: this.endSession
        },
      }
    };
  }
}