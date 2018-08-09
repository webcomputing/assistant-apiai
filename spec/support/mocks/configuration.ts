import { ServicesConfiguration } from "assistant-source";
import * as fakeRedis from "fakeredis";
import { ApiaiConfiguration } from "../../../src/components/apiai/public-interfaces";
import { validRequestContext } from "./request-context";

let specSetupId = 0;

export const configuration: ApiaiConfiguration = {
  authenticationHeaders: {
    secretHeader1: "value1",
    secretHeader2: "value2",
  },

  route: validRequestContext.path,
};

export const serviceConfiguration: ServicesConfiguration = {
  sessionStorage: {
    factoryName: "redis",
    configuration: {
      redisClient: fakeRedis.createClient(6379, `redis-spec-setup-${++specSetupId}`, { fast: true }),
      maxLifeTime: 3600,
    },
  },
};
