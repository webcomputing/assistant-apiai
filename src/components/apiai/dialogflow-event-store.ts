export default class DialogflowEventStore {
  private static eventMapping: { [intent: string]: string[] } = {};

  private static _instance: DialogflowEventStore | undefined = undefined;

  constructor() {
    DialogflowEventStore._instance = this;
  }

  public static get instance() {
    return DialogflowEventStore._instance;
  }

  /**
   * Returns all stored intent event data.
   */
  public static all() {
    return this.eventMapping;
  }

  /**
   * Add events for a given intent to the store.
   * @param intent Intent-Name
   * @param events Array of event names
   */
  public static addEvents(intent: string, events: string[]) {
    /** Merge existing events with the new once */
    this.eventMapping[intent] = [...(this.eventMapping[intent] || []), ...events];
  }

  /**
   * Returns an array of all events matching to the given intent
   * @param intent Intent-Name
   */
  public static getEventsFor(intent: string) {
    return this.eventMapping[intent] || [];
  }

  /**
   * Reset DialogflowEventStore
   */
  public static clear() {
    this.eventMapping = {};
  }
}
