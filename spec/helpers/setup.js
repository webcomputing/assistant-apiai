require("reflect-metadata");
let assistantJsCore = require("assistant-source");
let ownDescriptor = require("../../src/components/apiai/descriptor").descriptor;
let mainState = require("../support/mocks/state").MainState;


beforeEach(function() {
  this.specHelper = new assistantJsCore.SpecSetup();

  // Bind and configure alexa extension
  this.specHelper.setup.registerComponent(ownDescriptor);

  // Prepare all other steps
  this.specHelper.prepare([mainState]);

  this.assistantJs = this.specHelper.setup;
  this.container = this.assistantJs.container;
});