import { SpecHelper } from "../src/spec-helper";

describe("Handler", function() {
  let apiaiHelper: SpecHelper;

  beforeEach(function() {
    apiaiHelper = new SpecHelper(this.specHelper);
  })

  it("is correctly linked to spec setup", function() {
    return apiaiHelper.pretendIntentCalled("test").then(handler => {
      expect(handler.endSession).toBeTruthy();
      expect(handler.voiceMessage).toBe("Hello from api.ai!");
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