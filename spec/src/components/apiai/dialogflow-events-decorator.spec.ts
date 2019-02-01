import DialogflowEventStore from "../../../../src/components/apiai/dialogflow-event-store";
import { dialogflowEvents } from "../../../../src/components/apiai/dialogflow-events-decorator";

interface CurrentThisContext {
  dialogflowEventsState: any;
  getAllEvents: () => { [intentName: string]: string[] };
}

describe("@dialogflowEvents", function() {
  beforeEach(async function(this: CurrentThisContext) {
    /** Helper function: Returns all dialogflow events for each intent */
    this.getAllEvents = () => DialogflowEventStore.all();
  });

  afterEach(async function(this: CurrentThisContext) {
    /** After each spec execution we have to reset the DialogflowEventStore because it is a singleton and the instance will not be deleted. */
    DialogflowEventStore.clear();
  });

  describe("with single intent", function() {
    describe("with single event", function() {
      beforeEach(async function(this: CurrentThisContext) {
        class DialogflowEventsState {
          @dialogflowEvents(["welcome"])
          public mainIntent() {}
        }

        this.dialogflowEventsState = new DialogflowEventsState();
      });

      it("writes a single intent to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getAllEvents()).length).toBe(1);
      });

      it("writes welcome event for the mainIntent to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents()).toEqual({ mainIntent: ["welcome"] });
      });
    });

    describe("with multiple events", function() {
      beforeEach(async function(this: CurrentThisContext) {
        // tslint:disable-next-line:max-classes-per-file
        class DialogflowEventsState {
          @dialogflowEvents(["welcome", "welcomeBack"])
          public mainIntent() {}
        }

        this.dialogflowEventsState = new DialogflowEventsState();
      });

      it("writes a single intent to the metadata keys", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getAllEvents()).length).toBe(1);
      });

      it("writes mainIntent with all annotated events to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents()).toEqual({ mainIntent: ["welcome", "welcomeBack"] });
      });
    });
  });

  describe("with multiple intents", function() {
    describe("with single event", function() {
      beforeEach(async function(this: CurrentThisContext) {
        // tslint:disable-next-line:max-classes-per-file
        class DialogflowEventsState {
          @dialogflowEvents(["done"])
          public welcomeIntent() {}
          @dialogflowEvents(["welcome"])
          public mainIntent() {}
        }
        this.dialogflowEventsState = new DialogflowEventsState();
      });

      it("writes two intents to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getAllEvents()).length).toBe(2);
      });

      it("writes mainIntent with welcome event to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents().mainIntent).toEqual(["welcome"]);
      });

      it("writes welcomeIntent with done event to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents().welcomeIntent).toEqual(["done"]);
      });
    });

    describe("with two events per intent", function() {
      beforeEach(async function(this: CurrentThisContext) {
        // tslint:disable-next-line:max-classes-per-file
        class DialogflowEventsState {
          @dialogflowEvents(["done", "introduction"])
          public welcomeIntent() {}
          @dialogflowEvents(["welcome", "letsGo"])
          public mainIntent() {}
        }
        this.dialogflowEventsState = new DialogflowEventsState();
      });

      it("writes two intents to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getAllEvents()).length).toBe(2);
      });

      it("writes mainIntent with welcome and letsGo event to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents().mainIntent).toEqual(["welcome", "letsGo"]);
      });

      it("writes welcomeIntent with done and introduction event to the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(this.getAllEvents().welcomeIntent).toEqual(["done", "introduction"]);
      });
    });
  });

  describe("without events", function() {
    // tslint:disable-next-line:max-classes-per-file
    class DialogflowEventsState {}

    beforeEach(async function(this: CurrentThisContext) {
      this.dialogflowEventsState = new DialogflowEventsState();
    });

    it("returns an empty hash", async function(this: CurrentThisContext) {
      expect(this.getAllEvents()).toEqual({});
    });
  });
});
