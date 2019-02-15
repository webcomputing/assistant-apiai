import { CLIDeploymentExtension, PlatformGenerator, RequestExtractor } from "assistant-source";
import { ComponentDescriptor } from "inversify-components";
import { homedir } from "os";
import { ApiAiDeployment } from "./deployment";
import { DialogflowClient } from "./dialogflow-client";
import { Extractor } from "./extractor";
import { Generator } from "./generator";
import { ApiAiHandler } from "./handler";
import { COMPONENT_NAME, Configuration, localServices } from "./private-interfaces";

export const defaultConfiguration: Configuration.Defaults = {
  route: "/apiai",
  entities: {
    number: "@sys.number",
    givenName: "@sys.given-name",
    date: "@sys.date",
  },
  defaultDisplayIsVoice: true,
  googleApplicationCredentials: `${homedir}/.config/assistant/dialogflow.json`,
};

export let descriptor: ComponentDescriptor<Configuration.Defaults> = {
  defaultConfiguration,
  name: COMPONENT_NAME,
  bindings: {
    root: (bindService, lookupService) => {
      bindService.bindExtension<RequestExtractor>(lookupService.lookup("core:unifier").getInterface("requestProcessor")).to(Extractor);

      bindService.bindExtension<PlatformGenerator.Extension>(lookupService.lookup("core:unifier").getInterface("platformGenerator")).to(Generator);

      bindService.bindLocalService<DialogflowClient>(localServices.dialogflowClient).to(DialogflowClient);

      bindService.bindExtension<CLIDeploymentExtension>(lookupService.lookup("core:root").getInterface("deployments")).to(ApiAiDeployment);
    },
    request: bindService => {
      bindService.bindGlobalService("current-response-handler").to(ApiAiHandler);
    },
  },
};
