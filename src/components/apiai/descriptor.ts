import { PlatformGenerator, RequestExtractor } from "assistant-source";
import { ComponentDescriptor } from "inversify-components";
import { Extractor } from "./extractor";
import { Generator } from "./generator";
import { ApiAiHandler } from "./handler";
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
  defaultConfiguration,
  name: COMPONENT_NAME,
  bindings: {
    root: (bindService, lookupService) => {
      bindService.bindExtension<RequestExtractor>(lookupService.lookup("core:unifier").getInterface("requestProcessor")).to(Extractor);

      bindService.bindExtension<PlatformGenerator.Extension>(lookupService.lookup("core:unifier").getInterface("platformGenerator")).to(Generator);
    },
    request: bindService => {
      bindService.bindGlobalService("current-response-handler").to(ApiAiHandler);
    },
  },
};
