import { Component } from "inversify-components";
import { SpecSetup, PlatformSpecHelper, intent, RequestContext, } from "assistant-source";

import { Extraction, HandlerInterface } from "./components/apiai/public-interfaces";
import { ApiAiHandle } from "./components/apiai/handle";

export class SpecHelper implements PlatformSpecHelper {
  specSetup: SpecSetup

  constructor(assistantSpecSetup: SpecSetup) {
    this.specSetup = assistantSpecSetup;
  }

  async pretendIntentCalled(intent: intent, autoStart = true, additionalExtractions = {}, additionalContext = {}): Promise<HandlerInterface> {
    let extraction: Extraction = Object.assign({
      platform: "apiai",
      intent: intent,
      sessionID: "apiai-mock-session-id",
      language: "en",
      spokenText: "this is the spoken text",
      additionalParameters: {}
    }, additionalExtractions);

    let context: RequestContext = Object.assign({
      id: 'my-request-id',
      method: 'POST',
      path: '/apiai',
      body: {},
      headers: {},
      responseCallback: () => {}
    }, additionalContext);

    this.specSetup.createRequestScope(extraction, context);

    // Bind handler as singleton
    this.specSetup.setup.container.inversifyInstance.unbind("apiai:current-response-handler");
    this.specSetup.setup.container.inversifyInstance.bind("apiai:current-response-handler").to(ApiAiHandle).inSingletonScope();
    
    // auto run machine if wanted
    if (autoStart) {
      await this.specSetup.runMachine();
    }
    
    return this.specSetup.setup.container.inversifyInstance.get<ApiAiHandle>("apiai:current-response-handler");  
  }
}