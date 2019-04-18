import * as fs from "fs";
import { Component, getMetaInjectionName } from "inversify-components";
import { ApiAiDeployment } from "../../../../src/components/apiai/deployment";
import { DialogflowClient } from "../../../../src/components/apiai/dialogflow-client";
import { COMPONENT_NAME, Configuration } from "../../../../src/components/apiai/private-interfaces";
import { ThisContext } from "../../../support/this-context";

interface CurrentThisContext extends ThisContext {
  /** Instance of the current ApiAiDeployment */
  deployment: ApiAiDeployment;
  /** Current build directory */
  buildDir: string;
  /** Instance of the current DialogflowClient */
  dialogflowClient: DialogflowClient;
  /** Placeholder for all used spy objects */
  spies: any;
  /** Current build timestamp */
  buildTimeStamp: number;
}

describe("ApiAiDeployment", function() {
  beforeEach(async function(this: CurrentThisContext) {
    this.spies = {};
    this.spies.exportConfig = jasmine.createSpy("exportConfig");
    this.spies.restoreConfig = jasmine.createSpy("restoreConfig");

    this.buildTimeStamp = Date.now();

    this.dialogflowClient = {
      restoreConfig: this.spies.restoreConfig,
      exportConfig: this.spies.exportConfig,
    } as any;

    /** Create an instance of the ApiAiDeployment */
    this.deployment = new ApiAiDeployment(this.dialogflowClient);

    this.buildDir = "tmp";
  });

  describe("#execute", function() {
    beforeEach(async function(this: CurrentThisContext) {
      this.deployment.execute(this.buildDir);
    });

    it("will export the given configuration as an export", async function(this: CurrentThisContext) {
      expect(this.spies.exportConfig).toHaveBeenCalledWith(this.buildDir);
    });

    it("will restore the generated configuration to the given dialogflow agent", async function(this: CurrentThisContext) {
      expect(this.spies.restoreConfig).toHaveBeenCalledWith(this.buildDir);
    });
  });
});
