import { intent, PlatformSpecHelper, RequestContext, SpecHelper } from "../../AssistantJS/dts/assistant-source";
import { ApiAiHandler } from "./components/apiai/handler";
import { Extraction, ApiAiSpecificTypes } from "./components/apiai/public-interfaces";

export class ApiAiSpecHelper implements PlatformSpecHelper {
  constructor(public specSetup: SpecHelper) {}

  async pretendIntentCalled(intent: intent, autoStart = true, additionalExtractions = {}, additionalContext = {}) {
    let extraction: Extraction = Object.assign(
      {
        platform: "apiai",
        intent: intent,
        sessionID: "apiai-mock-session-id",
        language: "en",
        spokenText: "this is the spoken text",
        requestTimestamp: "2017-06-24T16:00:18Z",
        additionalParameters: {},
      },
      additionalExtractions
    );

    let context: RequestContext = Object.assign(
      {
        id: "my-request-id",
        method: "POST",
        path: "/apiai",
        body: {},
        headers: {},
        responseCallback: () => {},
      },
      additionalContext
    );

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

    return this.specSetup.setup.container.inversifyInstance.get<ApiAiHandler<ApiAiSpecificTypes>>("apiai:current-response-handler") as any;
  }
}
