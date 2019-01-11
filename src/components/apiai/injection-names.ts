/** Names of injectionable services, leads to fewer typing errors for most important injections */
export const componentInjectionNames = {
  /**
   * Inject an instance of @type {Component<Configuration.Runtime>}
   */
  apiaiComponent: "meta:component//apiai",
  /**
   * Inject an instance of @type {ApiAiHandler}
   */
  apiaiResponseHandler: "apiai:current-response-handler",
};
