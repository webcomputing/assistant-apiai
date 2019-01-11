/** Names of injectionable services, leads to fewer typing errors for most important injections */
export const apiaiInjectionNames = {
  /**
   * Inject an instance of @type {Component<Configuration.Runtime>}
   */
  component: "meta:component//apiai",
  /**
   * Namespace for services which are only available in the request scope.
   */
  current: {
    /**
     * Inject an instance of @type {ApiAiHandler}
     */
    responseHandler: "apiai:current-response-handler",
  },
};
