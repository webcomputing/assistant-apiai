## Integration of api.ai into AssistantJS
This package integrates [api.ai][1] (now known as "dialogflow") into [AssistantJS][2]. Just install it with `npm install assistant-apiai --save` and add it as an dependency to your `index.ts`:
```typescript

```
This component also integrates a generator into AssistantJS. So, executing `assistant g`, creates a dialogflow-specific build in your `builds` directory.

### Configuration
Possible configuration options, as listed in our [interfaces.ts](src/components/apiai/interfaces.ts):
```typescript
export interface OptionalConfiguration {
  /** Route for api.ai requests, default: '/apiai */
  route?: string;

  /** Entitiy configuration for api.ai, default: {} */
  entities?: { [name: string]: string };

  /** If set to true and if there is no chat bubble text, "displayText" will be set to the voiceResponse, default: true */
  defaultDisplayIsVoice?: boolean;
};

export interface Configuration extends OptionalConfiguration {};
```
All configuration options are optional.

[1]: https://dialogflow.com/
[2]: http://assistantjs.org