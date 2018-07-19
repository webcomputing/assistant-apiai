require("reflect-metadata");
let assistantJsCore = require("assistant-source");
let ownDescriptor = require("../../src/components/apiai/descriptor").descriptor;
let mainState = require("../support/mocks/state").MainState;
const fakeRedis = require("fakeredis");
const configuration = require("../support/mocks/configuration").configuration;

let specSetupId = 0;

beforeEach(function() {
  this.specHelper = new assistantJsCore.SpecHelper();

  this.assistantJs = this.specHelper.setup;

  this.container = this.assistantJs.container;

  // Bind and configure apiai extension
  this.specHelper.setup.registerComponent(ownDescriptor);
  this.specHelper.setup.configureComponent("apiai", configuration);

  // Override configuration of services to include fakeredis
  this.assistantJs.addConfiguration({
    "core:services": {
      sessionStorage: {
        factoryName: "redis",
        configuration: {
          redisClient: fakeRedis.createClient(6379, `redis-spec-setup-${++specSetupId}`, { fast: true }),
          maxLifeTime: 3600,
        },
      },
    },
  });

  // Prepare all other steps
  this.specHelper.prepare([mainState]);
});
