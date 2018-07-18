import { ApiAiSpecHelper } from "../src/spec-helper";

describe("Handler", function() {
  let apiaiHelper: ApiAiSpecHelper;

  beforeEach(function() {
    apiaiHelper = new ApiAiSpecHelper(this.specHelper);
  });

  it("is correctly linked to spec setup", function() {
    return apiaiHelper.pretendIntentCalled("test").then(handler => {
      expect(handler.endSession).toBeTruthy();
      expect(handler.voiceMessage).toBe("Hello from api.ai!");
    });
  });

  it("sets voice message as display text per default (by using 'undefined', which makes dialogflow apply this default)", function() {
    return apiaiHelper.pretendIntentCalled("test").then(handler => {
      expect((handler as any).getBody().displayText).toBeUndefined();
    });
  });

  describe("with chat bubbles given", function() {
    it("concatenates bubbles to displayText", function() {
      return apiaiHelper.pretendIntentCalled("chatTest").then(handler => {
        expect((handler as any).getBody().displayText).toBe("Bubble 1 Bubble 2");
      });
    });
  });

  it("cannot be executed twice", function() {
    return apiaiHelper.pretendIntentCalled("test").then(handler => {
      expect(function() {
        handler.sendResponse();
      }).toThrow();
    });
  });
});
