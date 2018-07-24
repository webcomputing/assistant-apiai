export const validRequestContext = {
  responseCallback: () => {},
  path: "/apiai",
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8",
    accept: "application/json",
    secretHeader1: "value1",
    secretHeader2: "value2",
  },
  body: {
    responseId: "my-dialogflow-response-id",
    session: "my-dialogflow-session",
    queryResult: {
      queryText: "user's original agent query",
      languageCode: "en",
      parameters: {
        param1: "param-value1",
        param2: "param-value2",
      },
      allRequiredParamsPresent: true,
      fulfillmentMessages: [
        {
          text: {
            text: [""],
          },
        },
      ],
      intent: {
        name: "my-unique-dialogflow-intent-name",
        displayName: "Matched Intent Name",
      },
      intentDetectionConfidence: 1,
    },
    originalDetectIntentRequest: {
      payload: {
        key1: "value1",
      },
    },
  },
};
