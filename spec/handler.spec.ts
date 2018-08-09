import { SpecHelper } from "assistant-source";
import { ApiAiSpecificHandable, ApiAiSpecificTypes } from "../src/assistant-apiai";
import { ApiAiSpecHelper } from "../src/spec-helper";

interface CurrentThisContext {
  specHelper: SpecHelper;
  apiAiSpecHelper: ApiAiSpecHelper;
  handler: ApiAiSpecificHandable<ApiAiSpecificTypes>;
  results: Partial<ApiAiSpecificTypes>;
}

describe("Handler", function() {
  beforeEach(async function(this: CurrentThisContext) {
    this.apiAiSpecHelper = new ApiAiSpecHelper(this.specHelper);
    this.handler = await this.apiAiSpecHelper.pretendIntentCalled("test");
    this.results = this.specHelper.getResponseResults();
  });

  it("is correctly linked to spec setup", function(this: CurrentThisContext) {
    expect(this.results.shouldSessionEnd).toBeTruthy();
    expect(this.results.voiceMessage).toBeTruthy();
    expect(this.results.voiceMessage!.text).toBe("Hello from api.ai!");
  });

  it("cannot be executed twice", async function(this: CurrentThisContext) {
    try {
      await this.handler.send();
      fail("should throw error");
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
