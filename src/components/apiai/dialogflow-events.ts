import "reflect-metadata";

export const dialogflowEventsMetadataKey = Symbol("metadata-key: dialogflowEvents");

/**
 * Allows you to annotate an intent method with fitting events.
 * If an DialogFlow event will occur the event will be matched to the
 * annotated intents and no unhandled intent method will raised up.
 * @param events List of Dialogflow-Events {@link https://dialogflow.com/docs/events }
 */
export const dialogflowEvents = (events: string[]) => {
  return (targetClass, propertyKey: string) => {
    /** Get bound dialogflowEventsMetadataKey */
    const currentMetadata = Reflect.getMetadata(dialogflowEventsMetadataKey, targetClass) || {};
    /** Rebind dialogflowEventsMetadataKey */
    Reflect.defineMetadata(dialogflowEventsMetadataKey, { ...{ [propertyKey]: events }, ...currentMetadata }, targetClass);
  };
};
