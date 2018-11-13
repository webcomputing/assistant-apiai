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
  implements ApiAiSpecificHandable<MergedAnswerTypes>, OptionalHandlerFeatures.SuggestionChips<MergedAnswerTypes> {
  public specificWhitelist: string[] = [];

  /**
   * ToDo: Remove from ApiAi with mixins and implemented Interface. Also remove l. 41-42 below
   */
  public setSuggestionChips!: (suggestionChips: MergedAnswerTypes["suggestionChips"] | Promise<MergedAnswerTypes["suggestionChips"]>) => this;

  constructor(
    @inject(injectionNames.current.requestContext) requestContext: RequestContext,
    @inject(injectionNames.current.extraction) extraction: MinimalRequestExtraction,
    @inject(injectionNames.current.killSessionService) killSession: () => Promise<void>,
    @inject(injectionNames.current.responseHandlerExtensions)
    responseHandlerExtensions: ResponseHandlerExtensions<MergedAnswerTypes, ApiAiSpecificHandable<MergedAnswerTypes>>
  ) {
    super(requestContext, extraction, killSession, responseHandlerExtensions);
  }

  protected getBody(results: Partial<MergedAnswerTypes>): DialogflowInterface.WebhookResponse<Partial<MergedAnswerTypes>> {
    const response: DialogflowInterface.WebhookResponse<any> = {};

    if (results.voiceMessage) {
      response.fulfillmentText = results.voiceMessage.text;
    }

    /** Todo: also remove */
    response.payload = results;

    return response;
  }
}

/**
 * Apply Mixins
 */
applyMixin(ApiAiHandler, [SuggestionChipsMixin]);
