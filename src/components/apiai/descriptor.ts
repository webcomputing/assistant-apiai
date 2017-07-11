import { ComponentDescriptor } from "inversify-components";
import { unifierInterfaces } from "assistant-source";
import { Extractor } from "./extractor";
import { OptionalConfiguration } from "./interfaces";
import { ApiAiHandle } from "./handle";
import { Builder } from "./builder";

export const defaultConfiguration: OptionalConfiguration = {
  route: "/apiai",
  entities: {
    number: "@sys.number",
    givenName: "@sys.given-name",
    date: "@sys.date"
  }
};

export let descriptor: ComponentDescriptor = {
  name: "apiai",
  defaultConfiguration: defaultConfiguration,
  bindings: {
    root: (bindService, lookupService) => {
      bindService
        .bindExtension<unifierInterfaces.RequestConversationExtractor>(lookupService.lookup("core:unifier").getInterface("requestProcessor"))
        .to(Extractor);

      bindService.bindExtension<unifierInterfaces.PlatformGenerator>(lookupService.lookup("core:unifier").getInterface("platformGenerator")).to(Builder);
    },
    request: (bindService) => {
      bindService.bindGlobalService("current-response-handler").to(ApiAiHandle);
    }
  }
};
