import {
  applyMixin,
  BasicHandler,
  injectionNames,
  MinimalRequestExtraction,
  OptionalHandlerFeatures,
  RequestContext,
  ResponseHandlerExtensions,
  SuggestionChipsMixin,
} from "assistant-source";
import { inject, injectable } from "inversify";
import { ApiAiSpecificHandable, ApiAiSpecificTypes, DialogflowInterface } from "./public-interfaces";

@injectable()
export class ApiAiHandler<MergedAnswerTypes extends ApiAiSpecificTypes> extends BasicHandler<MergedAnswerTypes>
  implements ApiAiSpecificHandable<MergedAnswerTypes> {
  public specificWhitelist: string[] = [];

  constructor(
    @inject(injectionNames.current.requestContext) requestContext: RequestContext,
    @inject(injectionNames.current.extraction) extraction: MinimalRequestExtraction,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject(injectionNames.current.responseHandlerExtensions)
    responseHandlerExtensions: ResponseHandlerExtensions<MergedAnswerTypes, ApiAiSpecificHandable<MergedAnswerTypes>>
  ) {
    super(requestContext, extraction, killSession, responseHandlerExtensions);
  }

  protected getBody(results: Partial<MergedAnswerTypes>): DialogflowInterface.WebhookResponse<any> {
    const response: DialogflowInterface.WebhookResponse<any> = {};

    if (results.voiceMessage) {
      response.fulfillmentText = results.voiceMessage.text;
    }

    return response;
  }
}

/**
 * Apply Mixins
 */
applyMixin(ApiAiHandler, [SuggestionChipsMixin]);
