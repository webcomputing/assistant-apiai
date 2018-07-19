import { intent as Intent, PlatformSpecHelper, RequestContext, SpecHelper } from "assistant-source";
import { ApiAiHandler } from "./components/apiai/handler";
import { ApiAiSpecificTypes, Extraction } from "./components/apiai/public-interfaces";

export class ApiAiSpecHelper implements PlatformSpecHelper<ApiAiSpecificTypes, ApiAiHandler<ApiAiSpecificTypes>> {
  constructor(public specSetup: SpecHelper) {}

  public async pretendIntentCalled(intent: Intent, autoStart = true, additionalExtractions = {}, additionalContext = {}) {
    const extraction: Extraction = {
      intent,
      platform: "apiai",
      sessionID: "apiai-mock-session-id",
      language: "en",
      spokenText: "this is the spoken text",
      requestTimestamp: "2017-06-24T16:00:18Z",
      additionalParameters: {},
      ...additionalExtractions,
    };

    const context: RequestContext = {
      id: "my-request-id",
      method: "POST",
      path: "/apiai",
      body: {},
      headers: {},
      responseCallback: () => {},
      ...additionalContext,
    };

    this.specSetup.createRequestScope(extraction, context);

    // Bind handler as singleton
    this.specSetup.setup.container.inversifyInstance.unbind("apiai:current-response-handler");
    this.specSetup.setup.container.inversifyInstance
      .bind("apiai:current-response-handler")
      .to(ApiAiHandler)
      .inSingletonScope();

    // auto run machine if wanted
    if (autoStart) {
      await this.specSetup.runMachine();
    }

    return this.specSetup.setup.container.inversifyInstance.get<ApiAiHandler<ApiAiSpecificTypes>>("apiai:current-response-handler");
  }
}
