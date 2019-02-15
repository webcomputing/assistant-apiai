import { injectionNames, Logger } from "assistant-source";
import * as fs from "fs";
import { auth } from "google-auth-library";
import { Component, getMetaInjectionName } from "inversify-components";
import { ApiAiDeployment } from "../../../../src/components/apiai/deployment";
import { DialogflowClient } from "../../../../src/components/apiai/dialogflow-client";
import { COMPONENT_NAME, Configuration } from "../../../../src/components/apiai/private-interfaces";
import { ThisContext } from "../../../support/this-context";

interface CurrentThisContext extends ThisContext {
  /** Instance of the current component metadata */
  componentMeta: Component<Configuration.Runtime>;
  /** Instance of the current DialogflowClient */
  dialogflowClient: DialogflowClient;
  /** Spy instance from the auth.request method  */
  requestSpy: jasmine.Spy;
  /** Spy instance from the toString method of the Buffer object */
  bufferToStringSpy: jasmine.Spy;
  /** Instance of the current component logger */
  logger: Logger;
  /** Response date witch will be returned by the auth.request spy */
  responseData: { data?: { response?: { agentContent?: string } } };
  /** Current build directory path  */
  buildDir: string;
  /** Returned value from the existsSync method  */
  existsSyncReturn: boolean;
  /** Returned value from the readFileSync method */
  readFileSyncReturn: any;
  /** Spec spy instances. */
  spys: any;
  /** Current instance of the ApiAiDeployment */
  ApiAiDeployment: ApiAiDeployment;
}

const { getClient, getProjectId, request } = auth;
const { writeFileSync, mkdirSync, existsSync, readFileSync } = fs;
const { from } = Buffer;

describe("DialogflowClient", function() {
  afterEach(async function(this: CurrentThisContext) {
    /** Reset mocked function */
    (auth as any).request = request;
    (auth as any).getProjectId = getProjectId;
    (auth as any).getClient = getClient;
    (fs as any).writeFileSync = writeFileSync;
    (fs as any).mkdirSync = mkdirSync;
    (fs as any).existsSync = existsSync;
    (fs as any).readFileSync = readFileSync;
    (Buffer as any).from = from;
  });

  beforeEach(async function(this: CurrentThisContext) {
    /** Inject constructor parameters */
    this.componentMeta = this.container.inversifyInstance.get<Component<Configuration.Runtime>>(getMetaInjectionName(COMPONENT_NAME));
    this.logger = this.container.inversifyInstance.get<Logger>(injectionNames.logger);

    /** Create spy Objects and mock values */
    this.spys = {};

    this.buildDir = "tmp";

    this.responseData = { data: { response: { agentContent: "data" } } };

    this.requestSpy = jasmine.createSpy("request").and.callFake((...any) => {
      return this.responseData;
    });

    (auth as any).getProjectId = jasmine.createSpy("getProjectId").and.callFake(() => "demo");

    (auth as any).getClient = jasmine.createSpy("getClient").and.callFake(() => {
      return { request: this.requestSpy };
    });

    (fs as any).writeFileSync = jasmine.createSpy("writeFileSync");

    (fs as any).mkdirSync = jasmine.createSpy("mkdirSync").and.callThrough();

    this.existsSyncReturn = true;
    (fs as any).existsSync = jasmine.createSpy("existsSync").and.callFake((...args) => this.existsSyncReturn);

    this.readFileSyncReturn = "readFileSyncReturn";
    (fs as any).readFileSync = jasmine.createSpy("readFileSync").and.callFake((...args) => this.readFileSyncReturn);

    this.bufferToStringSpy = jasmine.createSpy("bufferToStringSpy").and.returnValue("data");

    (Buffer as any).from = jasmine.createSpy("from").and.callFake(() => {
      return { toString: this.bufferToStringSpy };
    });

    /** Initialize DialogflowClient */
    this.dialogflowClient = new DialogflowClient(this.componentMeta, this.logger);
  });

  describe("#exportConfig", function() {
    describe("with valid response from google", function() {
      beforeEach(async function(this: CurrentThisContext) {
        await this.dialogflowClient.exportConfig(this.buildDir);
      });

      it("determine the projectId", async function(this: CurrentThisContext) {
        expect(auth.getProjectId).toHaveBeenCalled();
      });

      it("creates an export request", async function(this: CurrentThisContext) {
        expect(this.requestSpy).toHaveBeenCalledWith(
          jasmine.objectContaining({
            url: jasmine.stringMatching("https://dialogflow.googleapis.com/v2/projects/demo/agent:export"),
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      it("writes the exported data to an zip file", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).toHaveBeenCalled();
      });

      it("saves the backup zip within the build directory", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          jasmine.stringMatching(`${this.buildDir}/deployments/backup-dialogflow.zip`),
          jasmine.anything(),
          jasmine.any(String)
        );
      });

      it("writes binary encoded data to zip file", async function(this: CurrentThisContext) {
        expect(Buffer.from).toHaveBeenCalledWith("data", "base64");
        expect(this.bufferToStringSpy).toHaveBeenCalledWith("binary");
      });
    });

    describe("without response data", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.responseData = {};
        spyOn(this.logger, "error");
        await this.dialogflowClient.exportConfig(this.buildDir);
      });

      it("will not writes the exported data to an zip file", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      });

      it("throws an missing data exception", async function(this: CurrentThisContext) {
        expect(this.logger.error).toHaveBeenCalledWith(new Error("Missing Data"));
      });
    });
  });

  describe("#restoreConfig", function() {
    it("determine the projectId", async function(this: CurrentThisContext) {
      await this.dialogflowClient.restoreConfig(this.buildDir);
      expect(auth.getProjectId).toHaveBeenCalled();
    });

    describe("with existing bundle file", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.existsSyncReturn = true;
        await this.dialogflowClient.restoreConfig(this.buildDir);
      });
      it("reads bundle file from disk", async function(this: CurrentThisContext) {
        expect(fs.readFileSync).toHaveBeenCalled();
      });

      describe("regarding configuration upload", function() {
        it("creates an http request", async function(this: CurrentThisContext) {
          expect(this.requestSpy).toHaveBeenCalled();
        });

        it("creates an http post request", async function(this: CurrentThisContext) {
          expect(this.requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ method: "POST" }));
        });

        it("creates an http request with content-type json", async function(this: CurrentThisContext) {
          expect(this.requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ headers: { "Content-Type": "application/json" } }));
        });

        describe("regarding file data extraction", function() {
          beforeEach(async function(this: CurrentThisContext) {
            this.spys.toString = jasmine.createSpy("toString");
            (fs as any).readFileSync = jasmine.createSpy("readFileSync").and.callFake(() => {
              return { toString: this.spys.toString };
            });

            this.dialogflowClient = new DialogflowClient(this.componentMeta, this.logger);
            (this.dialogflowClient as any).setGoogleClient = jasmine.createSpy();
            (this.dialogflowClient as any).googleClient = auth.getClient();
            await this.dialogflowClient.restoreConfig(this.buildDir);
          });

          it("encodes the configuration file data as a base64 string", async function(this: CurrentThisContext) {
            expect(this.spys.toString).toHaveBeenCalled();
          });
        });

        it("transmit the configuration zip file data", async function(this: CurrentThisContext) {
          expect(this.requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({ body: JSON.stringify({ agentContent: this.readFileSyncReturn }) }));
        });
      });
    });

    describe("with exception in dialogflow request", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.requestSpy = (() => {
          throw new Error();
        }) as any;
        this.dialogflowClient.restoreConfig(this.buildDir);
      });

      it("expect", async function(this: CurrentThisContext) {});
    });
    describe("without existing bundle file", function() {
      beforeEach(async function(this: CurrentThisContext) {
        (this.dialogflowClient as any).googleClient = auth.getClient();
        this.existsSyncReturn = false;
        await this.dialogflowClient.restoreConfig(this.buildDir);
      });

      it("reads bundle file from disk", async function(this: CurrentThisContext) {
        expect(fs.readFileSync).not.toHaveBeenCalled();
      });
    });
  });
});
