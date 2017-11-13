import { Configuration } from "../../../src/components/apiai/interfaces";
import { validRequestContext } from "./request-context";

export const configuration: Configuration = {
  authenticationHeaders: {
    "secretHeader1": "value1",
    "secretHeader2": "value2"
  },
  route: validRequestContext.path
};