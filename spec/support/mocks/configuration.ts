import { ApiaiConfiguration } from "../../../src/components/apiai/public-interfaces";
import { validRequestContext } from "./request-context";

export const configuration: ApiaiConfiguration = {
  authenticationHeaders: {
    "secretHeader1": "value1",
    "secretHeader2": "value2"
  },
  route: validRequestContext.path
};