import { BasicHandler, injectionNames, RequestContext, ResponseHandlerExtensions } from "assistant-source";
import { inject, injectable } from "inversify";
import { ApiAISpecificHandable, ApiAiSpecificTypes, DialogflowInterface } from "./public-interfaces";

@injectable()
export class ApiAiHandler<CustomTypes extends ApiAiSpecificTypes> extends BasicHandler<CustomTypes> implements ApiAISpecificHandable<CustomTypes> {
  public specificWhitelist: string[] = [];

  constructor(
    @inject(injectionNames.current.requestContext) extraction: RequestContext,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject(injectionNames.current.responseHandlerExtensions)
    responseHandlerExtensions: ResponseHandlerExtensions<CustomTypes, ApiAISpecificHandable<CustomTypes>>
  ) {
    super(extraction, killSession, responseHandlerExtensions);
  }

  protected getBody(results: Partial<CustomTypes>): DialogflowInterface.ResponseBody {
    const response: DialogflowInterface.ResponseBody = {};

    if (results.voiceMessage) {
      response.fulfillmentText = results.voiceMessage.text;
    }

    return response;
  }
}
