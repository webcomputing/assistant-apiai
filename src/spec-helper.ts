import { Component } from "ioc-container";
import { SpecSetup, unifierInterfaces, rootInterfaces } from "assistant-source";

import { Extraction, HandlerInterface } from "./components/apiai/interfaces";
import { ApiAiHandle } from "./components/apiai/handle";

export class SpecHelper implements unifierInterfaces.PlatformSpecHelper {
  specSetup: SpecSetup

  constructor(assistantSpecSetup: SpecSetup) {
    this.specSetup = assistantSpecSetup;
  }

  async pretendIntentCalled(intent: unifierInterfaces.intent, autoStart = true, additionalExtractions = {}, additionalContext = {}): Promise<HandlerInterface> {
    let extraction: Extraction = Object.assign({
      component: this.specSetup.setup.container.inversifyInstance.get<Component>("meta:component//apiai"),
      intent: intent,
      sessionID: "apiai-mock-session-id",
      language: "en",
      spokenText: "this is the spoken text"
    }, additionalExtractions);

    let context: rootInterfaces.RequestContext = Object.assign({
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