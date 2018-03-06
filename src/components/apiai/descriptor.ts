import { ComponentDescriptor } from "inversify-components";
import { PlatformGenerator, RequestExtractor } from "assistant-source";
import { Extractor } from "./extractor";
import { Configuration, COMPONENT_NAME } from "./private-interfaces";
import { ApiAiHandle } from "./handle";
import { Builder } from "./builder";

export const defaultConfiguration: Configuration.Defaults = {
  route: "/apiai",
  entities: {
    number: "@sys.number",
    givenName: "@sys.given-name",
    date: "@sys.date"
  },
  defaultDisplayIsVoice: true
};

export let descriptor: ComponentDescriptor<Configuration.Defaults> = {
  name: COMPONENT_NAME,
  defaultConfiguration: defaultConfiguration,
  bindings: {
    root: (bindService, lookupService) => {
      bindService
        .bindExtension<RequestExtractor>(lookupService.lookup("core:unifier").getInterface("requestProcessor"))
        .to(Extractor);

      bindService.bindExtension<PlatformGenerator.Extension>(lookupService.lookup("core:unifier").getInterface("platformGenerator")).to(Builder);
    },
    request: (bindService) => {
      bindService.bindGlobalService("current-response-handler").to(ApiAiHandle);
    }
  }
};
