import {
  intent,
  PlatformSpecHelper,
  RequestContext,
  SpecSetup
  } from "assistant-source";
import { Component } from "inversify-components";
import { ApiAiHandle } from "./components/apiai/handle";
import { ExtractionInterface, HandlerInterface } from "./components/apiai/public-interfaces";

export class SpecHelper implements PlatformSpecHelper {
  specSetup: SpecSetup;

  constructor(assistantSpecSetup: SpecSetup) {
    this.specSetup = assistantSpecSetup;
  }

  async pretendIntentCalled(intent: intent, autoStart = true, additionalExtractions = {}, additionalContext = {}): Promise<HandlerInterface> {
    let extraction: ExtractionInterface = Object.assign(
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
      .to(ApiAiHandle)
      .inSingletonScope();

    // auto run machine if wanted
    if (autoStart) {
      await this.specSetup.runMachine();
    }

    return this.specSetup.setup.container.inversifyInstance.get<ApiAiHandle>("apiai:current-response-handler");
  }
}
