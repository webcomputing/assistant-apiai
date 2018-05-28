import { PlatformGenerator, RequestExtractor } from "assistant-source";
import { ComponentDescriptor } from "inversify-components";
import { Builder } from "./builder";
import { Extractor } from "./extractor";
import { ApiAiHandle } from "./handle";
import { COMPONENT_NAME, Configuration } from "./private-interfaces";

export const defaultConfiguration: Configuration.Defaults = {
  route: "/apiai",
  entities: {
    number: "@sys.number",
    givenName: "@sys.given-name",
    date: "@sys.date",
  },
  defaultDisplayIsVoice: true,
};

export let descriptor: ComponentDescriptor<Configuration.Defaults> = {
  name: COMPONENT_NAME,
  defaultConfiguration: defaultConfiguration,
  bindings: {
    root: (bindService, lookupService) => {
      bindService.bindExtension<RequestExtractor>(lookupService.lookup("core:unifier").getInterface("requestProcessor")).to(Extractor);

      bindService.bindExtension<PlatformGenerator.Extension>(lookupService.lookup("core:unifier").getInterface("platformGenerator")).to(Builder);
    },
    request: bindService => {
      bindService.bindGlobalService("current-response-handler").to(ApiAiHandle);
    },
  },
};
