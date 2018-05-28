export const validRequestContext = { 
  responseCallback: () => {},
  path: '/apiai',
  method: 'POST',
  headers: 
  { 
    'content-type': 'application/json; charset=utf-8',
    accept: 'application/json',
    "secretHeader1": "value1",
    "secretHeader2": "value2"
  },
  body: { 
    sessionId: 'my-apiai-session-id',
    lang: 'en',
    timestamp: '2017-06-24T16:00:18Z',
    result: {
      resolvedQuery: 'my spoken query',
      metadata: {
        intentName: 'myIntent'
      },
      parameters: {
        entityOne: 'entityValue1',
        entityTwo: 'entityValue2'
      }
    }
  }
}