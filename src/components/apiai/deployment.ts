import { CLIDeploymentExtension } from "assistant-source";
import { inject, injectable } from "inversify";
import { DialogflowClient } from "./dialogflow-client";
import { localServices } from "./private-interfaces";

@injectable()
export class ApiAiDeployment implements CLIDeploymentExtension {
  constructor(@inject(localServices.dialogflowClient) private dialogflowClient: DialogflowClient) {}

  public async execute(buildPath: string) {
    // tslint:disable-next-line:no-console
    console.log("===============     APIAI DEPLOYMENT     ===============");

    /**
     * Creates an backup of the currently active dialogflow configuration
     */
    await this.dialogflowClient.exportConfig(buildPath);
    /**
     * Uploads the newly generated agent configuration
     */
    await this.dialogflowClient.restoreConfig(buildPath);

    // tslint:disable-next-line:no-console
    console.log("============        FINISHED.             ============");
    return;
  }
}
