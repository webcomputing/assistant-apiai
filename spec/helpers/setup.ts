// tslint:disable-next-line
require("reflect-metadata");

import { AssistantJSSetup, SpecHelper } from "assistant-source";
import { descriptor } from "../../src/assistant-apiai";
import { configuration, serviceConfiguration } from "../support/mocks/configuration";
import { MainState } from "../support/mocks/state";
import { ThisContext } from "../support/this-context";

beforeEach(function(this: ThisContext) {
  this.assistantJs = new AssistantJSSetup();
  this.specHelper = new SpecHelper(this.assistantJs);

  this.container = this.assistantJs.container;

  // Bind and configure apiai extension
  this.assistantJs.registerComponent(descriptor);
  this.assistantJs.configureComponent("apiai", configuration);

  // Override configuration of services to include fakeredis
  this.assistantJs.addConfiguration({
    "core:services": serviceConfiguration,
  });

  // Prepare all other steps
  this.specHelper.prepare([MainState]);
});
