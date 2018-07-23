import { BasicHandler, injectionNames, MinimalRequestExtraction, RequestContext, ResponseHandlerExtensions } from "assistant-source";
import { inject, injectable } from "inversify";
import { ApiAISpecificHandable, ApiAiSpecificTypes, DialogflowInterface } from "./public-interfaces";

@injectable()
export class ApiAiHandler<CustomTypes extends ApiAiSpecificTypes> extends BasicHandler<CustomTypes> implements ApiAISpecificHandable<CustomTypes> {
  public specificWhitelist: string[] = [];

  constructor(
    @inject(injectionNames.current.requestContext) requestContext: RequestContext,
    @inject(injectionNames.current.extraction) extraction: MinimalRequestExtraction,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject(injectionNames.current.responseHandlerExtensions)
    responseHandlerExtensions: ResponseHandlerExtensions<CustomTypes, ApiAISpecificHandable<CustomTypes>>
  ) {
    super(requestContext, extraction, killSession, responseHandlerExtensions);
  }

  protected getBody(results: Partial<CustomTypes>): DialogflowInterface.WebhookResponse<any> {
    const response: DialogflowInterface.WebhookResponse<any> = {};

    if (results.voiceMessage) {
      response.fulfillmentText = results.voiceMessage.text;
    }

    return response;
  }
}
