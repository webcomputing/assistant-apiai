import { dialogflowEvents, dialogflowEventsMetadataKey } from "../../../../src/components/apiai/dialogflow-events";

interface CurrentThisContext {
  dialogflowEventsState: any;
  getMetadataKeys: () => { [intentName: string]: string[] };
}

describe("@dialogflowEvents", function() {
  beforeEach(async function(this: CurrentThisContext) {
    /** Helper function: Returns bound dialogflowEventsMetadataKeys for each intent of the hole state */
    this.getMetadataKeys = () => Reflect.getMetadata(dialogflowEventsMetadataKey, this.dialogflowEventsState);
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

      it("writes a single intent to the metadata keys", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getMetadataKeys()).length).toBe(1);
      });

      it("writes welcome event for the mainIntent to the metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys()).toEqual({ mainIntent: ["welcome"] });
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
        expect(Object.keys(this.getMetadataKeys()).length).toBe(1);
      });

      it("writes mainIntent with all annotated events to the metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys()).toEqual({ mainIntent: ["welcome", "welcomeBack"] });
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

      it("writes two intents to the metadata keys", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getMetadataKeys()).length).toBe(2);
      });

      it("writes mainIntent with welcome event to metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys().mainIntent).toEqual(["welcome"]);
      });

      it("writes welcomeIntent with done event to metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys().welcomeIntent).toEqual(["done"]);
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

      it("writes two intents to the metadata keys", async function(this: CurrentThisContext) {
        expect(Object.keys(this.getMetadataKeys()).length).toBe(2);
      });

      it("writes mainIntent with welcome and letsGo event to metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys().mainIntent).toEqual(["welcome", "letsGo"]);
      });

      it("writes welcomeIntent with done and introduction event to metadata keys", async function(this: CurrentThisContext) {
        expect(this.getMetadataKeys().welcomeIntent).toEqual(["done", "introduction"]);
      });
    });
  });

  describe("without events", function() {
    // tslint:disable-next-line:max-classes-per-file
    class DialogflowEventsState {}

    beforeEach(async function(this: CurrentThisContext) {
      this.dialogflowEventsState = new DialogflowEventsState();
    });

    it("throws an missing event exception", async function(this: CurrentThisContext) {
      const metadataKey = Reflect.getMetadata(dialogflowEventsMetadataKey, this.dialogflowEventsState);
      expect(metadataKey).toBeUndefined();
    });
  });
});
