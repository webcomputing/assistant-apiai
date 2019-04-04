import { injectionNames, Logger } from "assistant-source";
import * as fs from "fs";
import { auth, Compute, JWT, UserRefreshClient } from "google-auth-library";
import { AuthClient } from "google-auth-library/build/src/auth/authclient";
import { inject, injectable } from "inversify";
import { Component, getMetaInjectionName } from "inversify-components";
import * as path from "path";
import { env } from "process";
import { COMPONENT_NAME, Configuration, DialogflowExportResponse } from "./private-interfaces";

/** URL to the google cloud server, needed to get an authentication token. (https://cloud.google.com/compute/docs/api/how-tos/authorization , https://dialogflow.com/docs/reference/v2-auth-setup) */
const GOOGLE_CLOUD_URLS = ["https://www.googleapis.com/auth/dialogflow", "https://www.googleapis.com/auth/cloud-platform"];
/** URL to the dialogflow project API. (https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent) */
const DIALOGFLOW_API_PROJECT_URL: string = "https://dialogflow.googleapis.com/v2/projects";

/**
 * Client for managing the dialogflow agent.
 */
@injectable()
export class DialogflowClient {
  private googleClient?: AuthClient;

  constructor(
    @inject(getMetaInjectionName(COMPONENT_NAME)) private componentMeta: Component<Configuration.Runtime>,
    @inject(injectionNames.logger) private logger: Logger
  ) {}

  /**
   * Restore the newly generated bundle.zip file to Dialogflow
   * @param buildDir current build directory like {root}/builds/12345678
   */
  public async restoreConfig(buildDir: string) {
    // tslint:disable-next-line:no-console
    console.log("Deploy generated bundle file...");

    const googleClient = await this.getGoogleClient();
    const projectId = await auth.getProjectId();

    try {
      const bundleFilePath = path.join(buildDir, "apiai", "bundle.zip");

      if (fs.existsSync(bundleFilePath)) {
        const currentDecodedConfigurationZip = fs.readFileSync(bundleFilePath).toString("base64");

        await googleClient.request({
          // https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent/restore
          url: `${DIALOGFLOW_API_PROJECT_URL}/${projectId}/agent:restore`,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentContent: currentDecodedConfigurationZip }),
        });

        // tslint:disable-next-line:no-console
        console.log("Generated bundle file is successfully deployed to the configured Dialogflow Agent");
      } else {
        throw new Error("Dialogflow bundle file could not be found. Probably the generator could not generate the Dialogflow specific configuration.");
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
    }
  }

  /**
   * Export the currently deployed Dialogflow agent configuration and store it to disk.
   * @param buildDir
   */
  public async exportConfig(buildDir: string) {
    // tslint:disable-next-line:no-console
    console.log("Export current Dialogflow configuration...");

    const googleClient = await this.getGoogleClient();
    const projectId = await auth.getProjectId();

    try {
      const dialogflowExportResponse = await googleClient.request<DialogflowExportResponse>({
        // https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2/projects.agent/export
        url: `${DIALOGFLOW_API_PROJECT_URL}/${projectId}/agent:export`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (
        dialogflowExportResponse &&
        dialogflowExportResponse.data &&
        dialogflowExportResponse.data.response &&
        dialogflowExportResponse.data.response.agentContent
      ) {
        this.createDir(path.join(buildDir, "deployments"));

        const agentContent = Buffer.from(dialogflowExportResponse.data.response.agentContent, "base64").toString("binary");
        const backupFilePath = path.join(buildDir, "deployments", "backup-dialogflow.zip");
        fs.writeFileSync(backupFilePath, agentContent, "binary");

        // tslint:disable-next-line:no-console
        console.log(`The old Dialogflow Agent configuration will be back up and could be found at: \n${backupFilePath}`);
      } else {
        throw new Error("Missing Data");
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Set the google client.
   */
  private getGoogleClient(): Promise<Compute | JWT | UserRefreshClient> {
    /** Use the given environment variable, the configured once or a default one */
    env.GOOGLE_APPLICATION_CREDENTIALS = env.GOOGLE_APPLICATION_CREDENTIALS || this.componentMeta.configuration.googleApplicationCredentials;

    /** Check if the given GOOGLE_APPLICATION_CREDENTIALS exists.  */
    if (!fs.existsSync(env.GOOGLE_APPLICATION_CREDENTIALS)) {
      throw new Error(
        `The given google application credentials file (GOOGLE_APPLICATION_CREDENTIALS='${process.env.GOOGLE_APPLICATION_CREDENTIALS}') does not exists.`
      );
    }

    return auth.getClient({ scopes: GOOGLE_CLOUD_URLS });
  }

  /**
   * Create a directory if it will not exists
   * @param dir Path to the new directory
   */
  private createDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
