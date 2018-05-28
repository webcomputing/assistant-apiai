require("reflect-metadata");
let assistantJsCore = require("assistant-source");
let ownDescriptor = require("../../src/components/apiai/descriptor").descriptor;
let mainState = require("../support/mocks/state").MainState;
const configuration = require("../support/mocks/configuration").configuration;

beforeEach(function() {
  this.specHelper = new assistantJsCore.SpecSetup();

  // Bind and configure apiai extension
  this.specHelper.setup.registerComponent(ownDescriptor);
  this.specHelper.setup.configureComponent("apiai", configuration);

  // Prepare all other steps
  this.specHelper.prepare([mainState]);

  this.assistantJs = this.specHelper.setup;
  this.container = this.assistantJs.container;
});
