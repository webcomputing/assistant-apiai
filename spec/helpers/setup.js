require("reflect-metadata");
let assistantJsCore = require("assistant-source");
let ownDescriptor = require("../../src/components/apiai/descriptor").descriptor;
let mainState = require("../support/mocks/state").MainState;
const configuration = require("../support/mocks/configuration").configuration;
const serviceConfiguration = require("../support/mocks/configuration").serviceConfiguration;

beforeEach(function() {
  this.assistantJs = new assistantJsCore.AssistantJSSetup();
  this.specHelper = new assistantJsCore.SpecHelper(this.assistantJs);

  this.container = this.assistantJs.container;

  // Bind and configure apiai extension
  this.assistantJs.registerComponent(ownDescriptor);
  this.assistantJs.configureComponent("apiai", configuration);

  // Override configuration of services to include fakeredis
  this.assistantJs.addConfiguration({
    "core:services": serviceConfiguration,
  });

  // Prepare all other steps
  this.specHelper.prepare([mainState]);
});
