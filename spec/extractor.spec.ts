import { componentInterfaces } from "assistant-source/lib/components/unifier/private-interfaces";
import { Extractor } from "../src/components/apiai/extractor";
import { validRequestContext } from "./support/mocks/request-context";
import {} from "../../AssistantJS/dts/assistant-source";

describe("this.extractor", function() {
  beforeEach(function() {
    this.extractor = this.container.inversifyInstance.get(componentInterfaces.requestProcessor);
    this.context = JSON.parse(JSON.stringify(validRequestContext));
  });

  describe("fits", function() {
    describe("with full mock this.context", function() {
      it("returns true", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeTruthy());
      });
    });

    describe("with no authenticationHeaders configured", function() {
      beforeEach(function() {
        (this.extractor as any).configuration.authenticationHeaders = {};
      });

      it("throws exception", function() {
        return this.extractor
          .fits(this.context)
          .then(result => fail())
          .catch(result => expect(true).toBeTruthy());
      });
    });

    describe("with wrong path", function() {
      beforeEach(function() {
        this.context.path = "/wrong-path";
      });

      it("returns false", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeFalsy());
      });
    });

    describe("with wrong format", function() {
      beforeEach(function() {
        delete this.context.body.sessionId;
      });

      it("returns false", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeFalsy());
      });
    });

    describe("with wrong authentication headers", function() {
      beforeEach(function() {
        this.context.headers.secretHeader1 = "wrongHeader";
      });

      it("returns false", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeFalsy());
      });
    });

    describe("with lowercase authentication headers", function() {
      beforeEach(function() {
        delete this.context.headers.secretHeader1;
        this.context.headers.secretheader1 = "value1";
      });

      it("still returns true", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeTruthy());
      });
    });

    describe("with uppercase authentication headers", function() {
      beforeEach(function() {
        delete this.context.headers.secretHeader1;
        this.context.headers.SECRETHEADER1 = "value1";
      });

      it("still returns true", function() {
        return this.extractor.fits(this.context).then(result => expect(result).toBeTruthy());
      });
    });
  });

  describe("extract", function() {
    it("returns correct extraction", async function(done) {
      this.extraction = await this.extractor.extract(this.context);

      expect(this.extraction).toEqual({
        sessionID: "my-apiai-session-id",
        intent: "myIntent",
        entities: { entityOne: "entityValue1", entityTwo: "entityValue2" },
        language: "en",
        requestTimestamp: "2017-06-24T16:00:18Z",
        platform: this.extractor.component.name,
        spokenText: "my spoken query",
        additionalParameters: {
          key1: "value1",
        },
      });
      done();
    });
  });
});
