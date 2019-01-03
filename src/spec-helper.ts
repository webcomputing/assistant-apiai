import { HandlerProxyFactory, injectionNames, intent as Intent, PlatformSpecHelper, RequestContext, SpecHelper } from "assistant-source";
import { ApiAiHandler } from "./components/apiai/handler";
import { ApiAiSpecificTypes, ExtractionInterface } from "./components/apiai/public-interfaces";

export class ApiAiSpecHelper implements PlatformSpecHelper<ApiAiSpecificTypes, ApiAiHandler<ApiAiSpecificTypes>> {
  constructor(public specHelper: SpecHelper) {}

  public async pretendIntentCalled(intent: Intent, additionalExtractions = {}, additionalContext = {}) {
    const extraction: ExtractionInterface = {
      intent,
      platform: "apiai",
      sessionID: "apiai-mock-session-id",
      language: "en",
      spokenText: "this is the spoken text",
      additionalParameters: {},
      ...additionalExtractions,
    };

    const context: RequestContext = {
      id: "my-request-id",
      method: "POST",
      path: "/apiai",
      body: {},
      headers: {},
      // tslint:disable-next-line:no-empty
      responseCallback: () => {},
      ...additionalContext,
    };

    this.specHelper.createRequestScope(extraction, context);

    // Bind handler as singleton
    this.specHelper.assistantJs.container.inversifyInstance.unbind("apiai:current-response-handler");
    this.specHelper.assistantJs.container.inversifyInstance
      .bind("apiai:current-response-handler")
      .to(ApiAiHandler)
      .inSingletonScope();

    const proxyFactory = this.specHelper.assistantJs.container.inversifyInstance.get<HandlerProxyFactory>(injectionNames.handlerProxyFactory);

    const currentHandler = this.specHelper.assistantJs.container.inversifyInstance.get<ApiAiHandler<ApiAiSpecificTypes>>("apiai:current-response-handler");
    const proxiedHandler = proxyFactory.createHandlerProxy(currentHandler);

    return proxiedHandler;
  }
}
