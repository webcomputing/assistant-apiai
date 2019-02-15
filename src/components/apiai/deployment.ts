import { CLIDeploymentExtension } from "assistant-source";
import { inject, injectable } from "inversify";
import { DialogflowClient } from "./dialogflow-client";
import { apiaiInjectionNames } from "./injection-names";
import { localServices } from "./private-interfaces";

// tslint:disable:no-console
@injectable()
export class ApiAiDeployment implements CLIDeploymentExtension {
  constructor(@inject(localServices.dialogflowClient) private dialogflowClient: DialogflowClient) {}

  public async execute(buildPath: string) {
    /**
     * Creates an backup of the currently active dialogflow configuration
     */
    await this.dialogflowClient.exportConfig(buildPath);
    /**
     * Uploads the newly generated agent configuration
     */
    await this.dialogflowClient.restoreConfig(buildPath);
    return;
  }
}
