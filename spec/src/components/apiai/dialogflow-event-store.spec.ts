import DialogflowEventStore from "../../../../src/components/apiai/dialogflow-event-store";
import { ThisContext } from "../../../support/this-context";

interface CurrentThisContext extends ThisContext {
  dialogflowEventStore: DialogflowEventStore;
}
describe("DialogflowEventStore", function() {
  afterEach(async function(this: CurrentThisContext) {
    DialogflowEventStore.clear();
  });

  describe(".all", function() {
    describe("with two intents", function() {
      beforeEach(async function(this: CurrentThisContext) {
        DialogflowEventStore.addEvents("helloWorld", ["WELCOME"]);
        DialogflowEventStore.addEvents("welcomeWorld", ["WELCOME"]);
      });

      it("returns two intents", async function(this: CurrentThisContext) {
        expect(Object.keys(DialogflowEventStore.all()).length).toBe(2);
      });

      it("returns a hash with helloWold and welcomeWord events", async function(this: CurrentThisContext) {
        expect(DialogflowEventStore.all()).toEqual({ helloWorld: ["WELCOME"], welcomeWorld: ["WELCOME"] });
      });
    });

    describe("without intents", function() {
      it("returns no data", async function(this: CurrentThisContext) {
        expect(Object.keys(DialogflowEventStore.all()).length).toBe(0);
      });
    });
  });

  describe(".addEvents", function() {
    describe("with single intent", function() {
      it("store intent to the DialogflowEventStore", async function(this: CurrentThisContext) {
        DialogflowEventStore.addEvents("helloWorld", ["WELCOME"]);
        expect(DialogflowEventStore.all()).toEqual({ helloWorld: ["WELCOME"] });
      });
    });

    describe("with two intents of the same name", function() {
      it("store intent only once to the DialogflowEventStore and merge the given events", async function(this: CurrentThisContext) {
        DialogflowEventStore.addEvents("helloWorld", ["WELCOME"]);
        DialogflowEventStore.addEvents("helloWorld", ["HELLO"]);
        expect(DialogflowEventStore.all()).toEqual({ helloWorld: ["WELCOME", "HELLO"] });
      });
    });
  });

  describe(".getEventsFor", function() {
    describe("with given intents", function() {
      beforeEach(async function(this: CurrentThisContext) {
        DialogflowEventStore.addEvents("helloWorld", ["WELCOME", "HELLO"]);
      });

      it("returns an array with the given events", async function(this: CurrentThisContext) {
        expect(DialogflowEventStore.getEventsFor("helloWorld")).toEqual(["WELCOME", "HELLO"]);
      });
    });

    describe("with non existing intent", function() {
      it("returns an empty array", async function(this: CurrentThisContext) {
        expect(DialogflowEventStore.getEventsFor("helloWorld")).toEqual([]);
      });
    });
  });

  describe(".clear", function() {
    describe("with given intents", function() {
      beforeEach(async function(this: CurrentThisContext) {
        DialogflowEventStore.addEvents("helloWorld", ["WELCOME", "HELLO"]);
      });

      it("deletes all stored intents", async function(this: CurrentThisContext) {
        DialogflowEventStore.clear();
        expect(DialogflowEventStore.all()).toEqual({});
      });
    });

    describe("without given intents", function() {
      it("deletes all stored intents", async function(this: CurrentThisContext) {
        DialogflowEventStore.clear();
        expect(DialogflowEventStore.all()).toEqual({});
      });
    });
  });

  describe(".instance", function() {
    describe("without instantiated DialogflowEventStore", function() {
      it("returns undefined", async function(this: CurrentThisContext) {
        expect(DialogflowEventStore.instance).toBeUndefined();
      });
    });

    describe("with instantiated DialogflowEventStore", function() {
      beforeEach(async function(this: CurrentThisContext) {
        new DialogflowEventStore();
      });

      it("returns in instance of the DialogflowEventStore", async function(this: CurrentThisContext) {
        expect(DialogflowEventStore.instance instanceof DialogflowEventStore).toBeTruthy();
      });
    });
  });
});
