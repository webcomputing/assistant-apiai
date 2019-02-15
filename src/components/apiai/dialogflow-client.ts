import { injectionNames, Logger } from "assistant-source";
import * as fs from "fs";
import { auth } from "google-auth-library";
import { AuthClient } from "google-auth-library/build/src/auth/authclient";
import { inject, injectable } from "inversify";
import { Component, getMetaInjectionName } from "inversify-components";
import { env } from "process";
import { COMPONENT_NAME, Configuration, DialogflowExportResponse } from "./private-interfaces";

const GOOGLE_CLOUD_URLS = ["https://www.googleapis.com/auth/dialogflow", "https://www.googleapis.com/auth/cloud-platform"];
const DIALOGFLOW_API_PROJECT_URL: string = "https://dialogflow.googleapis.com/v2/projects";
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
    await this.setGoogleClient();

    if (this.googleClient) {
      const projectId = await auth.getProjectId();

      try {
        const bundleFilePath = `${buildDir}/apiai/bundle.zip`;

        if (fs.existsSync(bundleFilePath)) {
          const currentDecodedConfigurationZip = fs.readFileSync(bundleFilePath).toString("base64");

          await this.googleClient.request({
            url: `${DIALOGFLOW_API_PROJECT_URL}/${projectId}/agent:restore`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentContent: currentDecodedConfigurationZip }),
          });
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * Export the currently deployed Dialogflow agent configuration and store it to disk.
   * @param buildDir
   */
  public async exportConfig(buildDir: string) {
    await this.setGoogleClient();

    if (this.googleClient) {
      const projectId = await auth.getProjectId();

      try {
        const dialogflowExportResponse = await this.googleClient.request<DialogflowExportResponse>({
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
          this.createDir(`${buildDir}/deployments`);

          const agentContent = Buffer.from(dialogflowExportResponse.data.response.agentContent, "base64").toString("binary");
          fs.writeFileSync(`${buildDir}/deployments/backup-dialogflow.zip`, agentContent, "binary");
        } else {
          throw new Error("Missing Data");
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * Set the google client.
   */
  private async setGoogleClient() {
    if (this.googleClient === undefined) {
      /** Use the given environment variable, the configured once or a default one */
      env.GOOGLE_APPLICATION_CREDENTIALS = env.GOOGLE_APPLICATION_CREDENTIALS || this.componentMeta.configuration.googleApplicationCredentials;

      /** Check if the given GOOGLE_APPLICATION_CREDENTIALS exists.  */
      if (!fs.existsSync(env.GOOGLE_APPLICATION_CREDENTIALS)) {
        throw new Error(
          `The given google application credentials file (GOOGLE_APPLICATION_CREDENTIALS='${process.env.GOOGLE_APPLICATION_CREDENTIALS}') does not exists.`
        );
      }

      this.googleClient = await auth.getClient({ scopes: GOOGLE_CLOUD_URLS });
    }
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
