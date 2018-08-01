## Integration of api.ai into AssistantJS

This package integrates [api.ai][1] (now known as "dialogflow") into [AssistantJS][2]. Just install it with `npm install assistant-apiai --save` and add it as an dependency to your `index.ts`:

```typescript
import { descriptor as apiAiDescriptor } from "assistant-apiai";

/** and below, in your "initializeSetups" method: */
assistantJs.registerComponent(apiAiDescriptor);
```

This component also integrates a generator into AssistantJS. So executing `assistant g` creates a dialogflow-specific build in your `builds` directory.

### Configuration

Possible configuration options, as listed in our [interfaces](src/components/apiai/private-interfaces.ts):

```typescript
/** These configuration options are optional */
export interface Defaults {
  /** Route for api.ai requests, default: '/apiai */
  route: string;

  /** Entitiy configuration for api.ai, default: {} */
  entities: { [name: string]: string };

  /** If set to true and if there is no chat bubble text, "displayText" will be set to the voiceResponse, default: true */
  defaultDisplayIsVoice: boolean;
}

/** These configuration options are required */
export interface Required {
  /**
   * List of header key/value-pairs which have to be present in an dialogflow request.
   * assistant-apiai checks if all headers are present and contain the respective value.
   * To configure, go to the "fulfillment" tab in your dialogflow console and add some secret header keys and (complex) values.
   * After that, add them to this object, for example: {"myFirstSecretHeader": "myVerySecretValue", "mySecondSecretHeader": "mySecondVerySecretValue"}.
   * That way, you are able to verify that an incomming request was really sent by your dialogflow agent.
   */
  authenticationHeaders: { [name: string]: string };
}
```

Merge your existing AssistantJS configuration from `config/components.ts` with `ApiaiConfigurationAttribute`.

After that add the Dialogflow-Types and the Dialogflow-Handler to the file config/handler.ts if you are using assistant-apiai without assistant-google.
If you use it with assistant-google, see the Readme from [assistant-google][3]
Replace or remove `ADD_OTHER_TYPES_HERE` and `ADD_OTHER_HANDLER_HERE<MergedAnswerTypes>` if needed.
```typescript
import { ApiAiSpecificTypes, ApiAiHandler } from "assistant-apiai";
import { State } from "assistant-source";

export type MergedAnswerTypes = ApiAiSpecificTypes & ADD_OTHER_TYPES_HERE;
export type MergedHandler = ApiAiHandler<CurrentAnswerTypes> & ADD_OTHER_HANDLER_HERE<MergedAnswerTypes>;

export type MergedSetupSet = State.SetupSet<MergedAnswerTypes, MergedHandler>
```

[1]: https://dialogflow.com/
[2]: http://assistantjs.org
[3]: https://github.com/webcomputing/assistant-google
