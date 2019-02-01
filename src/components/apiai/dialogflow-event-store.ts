export default class DialogflowEventStore {
  private static eventMapping: { [intent: string]: string[] } = {};

  private static _instance: DialogflowEventStore | undefined = undefined;

  constructor() {
    DialogflowEventStore._instance = this;
  }

  public static get instance() {
    return DialogflowEventStore._instance;
  }

  public static all() {
    return this.eventMapping;
  }

  public static addEvents(intent: string, events: string[]) {
    this.eventMapping[intent] = [...(this.eventMapping[intent] || []), ...events];
  }

  public static getEventsFor(intent: string) {
    return this.eventMapping[intent] || [];
  }

  public static clear() {
    this.eventMapping = {};
  }
}
