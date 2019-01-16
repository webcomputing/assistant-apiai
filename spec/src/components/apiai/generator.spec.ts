import * as archiver from "archiver";
import { GenericIntent, intent, PlatformGenerator } from "assistant-source";
import { Configuration } from "assistant-source/dts/components/unifier/private-interfaces";
import * as fs from "fs";
import { Component, getMetaInjectionName } from "inversify-components";
import { Generator } from "../../../../src/components/apiai/generator";
import { COMPONENT_NAME } from "../../../../src/components/apiai/private-interfaces";
import { ThisContext } from "../../../support/this-context";

interface CurrentThisContext extends ThisContext {
  params: {
    /** Language used by the apiai generator execute method */
    language: string;

    /** Build directory used by the apiai generator execute method */
    buildDir: string;

    /** Intent configuration used by the apiai generator execute method */
    intentConfigurations: PlatformGenerator.IntentConfiguration[];

    /** Entity mapping used by the apiai generator execute method */
    entityMapping: PlatformGenerator.EntityMapping;

    /** Custom entity mapping used by the apiai generator execute method */
    customEntityMapping: PlatformGenerator.CustomEntityMapping;
  };

  /** Component meta data used by the apiai generator class */
  componentMetaData: Component<Configuration.Runtime>;

  /** Spys of the mocked archiver module */
  archiverSpys: any;

  /** Returns an instance of the apiai generator class */
  getGenerator: () => Generator;

  /** Helper function for instantiation an apiai generator and call execute with default values */
  execGenerator: () => void;

  /** Helper function for validating intent schema structure */
  expectValidIntentSchemaFor: (intent) => void;

  /** Helper function for validating utterances schema structure */
  expectValidUtterancesSchemaFor: (intent) => void;
}

const { writeFileSync, mkdirSync, createWriteStream } = fs;
const { warn } = console;
const { stringify } = JSON;

describe("Generator", function() {
  beforeEach(async function(this: CurrentThisContext) {
    /** Disable file IO operations */
    (fs as any).mkdirSync = jasmine.createSpy("mkdirSync").and.callThrough();
    (fs as any).writeFileSync = jasmine.createSpy("writeFileSync").and.callThrough();
    (fs as any).createWriteStream = jasmine.createSpy("createWriteStream").and.callThrough();

    /** Mock JSON.stringify function, allows you to use jasmine.any or jasmine.anything in expect check. */
    JSON.stringify = (...args) => args[0];

    /** Mock the archiver module within apiai generator and disable disk operations. */
    this.archiverSpys = {
      pipe: jasmine.createSpy("pipe").and.callThrough(),
      directory: jasmine.createSpy("directory").and.callThrough(),
      file: jasmine.createSpy("file").and.callThrough(),
      finalize: jasmine.createSpy("finalize").and.callThrough(),
    };
    spyOn(archiver, "create").and.callFake(() => this.archiverSpys);

    /** Add spy on console.warn method */
    console.warn = jasmine.createSpy("warn");

    /** Set default execute params */
    this.params = {
      buildDir: "tmp",
      language: "en",
      intentConfigurations: [],
      entityMapping: {},
      customEntityMapping: {},
    };

    this.componentMetaData = this.container.inversifyInstance.get(getMetaInjectionName(COMPONENT_NAME));
    this.componentMetaData.configuration.entities = {};
    this.getGenerator = () => {
      const generator = new Generator(this.componentMetaData as any);
      spyOn(generator, "execute").and.callThrough();
      return generator;
    };

    this.execGenerator = async () => {
      this.getGenerator().execute(
        this.params.language,
        this.params.buildDir,
        this.params.intentConfigurations,
        this.params.entityMapping,
        this.params.customEntityMapping
      );
    };

    this.expectValidIntentSchemaFor = (intent: string | intent) => {
      const intentSchema = {
        id: jasmine.anything(),
        name: intent,
        auto: jasmine.any(Boolean),
        contexts: jasmine.any(Array),
        responses: [
          {
            resetContexts: jasmine.any(Boolean),
            affectedContexts: jasmine.any(Array),
            parameters: jasmine.any(Array),
            messages: jasmine.any(Array),
            defaultResponsePlatforms: jasmine.any(Object),
            speech: jasmine.any(Array),
          },
        ],
        priority: jasmine.any(Number),
        webhookUsed: jasmine.any(Boolean),
        webhookForSlotFilling: jasmine.any(Boolean),
        lastUpdate: jasmine.any(Number),
        fallbackIntent: jasmine.any(Boolean),
        events: jasmine.any(Array),
      };
      expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), intentSchema);
    };

    this.expectValidUtterancesSchemaFor = function(intent: string) {
      const utterancesSchema = {
        id: jasmine.anything(),
        count: jasmine.any(Number),
        data: jasmine.arrayContaining([
          {
            text: jasmine.any(String),
            userDefined: jasmine.any(Boolean),
          },
        ]),
        isTemplate: jasmine.any(Boolean),
      };

      expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching(`${intent}_usersays_${this.params.language}.json`), [utterancesSchema]);
    };
  });

  /** Helper function for expected intent functionality */
  function expectIntentWith(intent: string | intent, containingElements: Array<{}> = []) {
    it(`creates an intent definition file for ${intent}`, async function(this: CurrentThisContext) {
      expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/${intent}.json`, jasmine.anything());
    });

    containingElements.forEach(element => {
      it(`creates an intent definition file for ${intent} with expected data`, async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), jasmine.objectContaining(element));
      });
    });

    it("creates an intent definition file with valid intent schema", async function(this: CurrentThisContext) {});
  }

  afterEach(async function(this: CurrentThisContext) {
    (fs as any).mkdirSync = mkdirSync;
    (fs as any).writeFileSync = writeFileSync;
    (fs as any).createWriteStream = createWriteStream;
    // tslint:disable-next-line:no-console
    console.warn = warn;
    JSON.stringify = stringify;
  });

  describe("#execute", function() {
    beforeEach(async function(this: CurrentThisContext) {
      this.params.intentConfigurations = [
        {
          intent: "helloWorld",
          utterances: ["hello world"],
          entities: [],
        },
      ];
      this.params.entityMapping = {};
      this.params.customEntityMapping = {};
    });

    describe("with customEntityMapping", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.params.intentConfigurations = [
          {
            intent: "helloWorld",
            utterances: ["hello {{entity1}}"],
            entities: ["entity1"],
          },
        ];

        this.params.entityMapping = { entity1: "ENTITIES_TYPE", ENTITIES_TYPE: "ENTITIES_TYPE" };

        this.params.customEntityMapping = {
          ENTITIES_TYPE: [{ value: "entity1" }],
        };
      });

      describe("checking build directories", function() {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it("creates an apiai build directory", async function(this: CurrentThisContext) {
          expect(fs.mkdirSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai`);
        });

        it("creates an entities folder in the apiai build directory", async function(this: CurrentThisContext) {
          expect(fs.mkdirSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/entities`);
        });

        it("creates an intents folder in the apiai build directory", async function(this: CurrentThisContext) {
          expect(fs.mkdirSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents`);
        });
      });

      describe("with entity examples", function() {
        beforeEach(async function(this: CurrentThisContext) {
          this.params.intentConfigurations[0].utterances = ["Hello {{world|entity1}}"];
          await this.execGenerator();
        });

        it("extracts entity example from utterance and map to a custom data type", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching(`${this.params.intentConfigurations[0].intent}_usersays`), [
            jasmine.objectContaining({ data: jasmine.arrayContaining([{ text: "world", alias: "entity1", meta: "@ENTITIES_TYPE", userDefined: true }]) }),
          ]);
        });

        it("splits entity example and utterances to separate data elements", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching(`${this.params.intentConfigurations[0].intent}_usersays`), [
            jasmine.objectContaining({
              data: [jasmine.objectContaining({ text: "Hello " }), jasmine.objectContaining({ text: "world" })],
            }),
          ]);
        });
      });

      describe("with wrong entity mapping", function() {
        beforeEach(async function(this: CurrentThisContext) {
          this.params.entityMapping = { entity1: "WRONG_ENTITY" as any };
        });

        it("throws an missing apiai configuration type error", async function(this: CurrentThisContext) {
          try {
            await this.execGenerator();
            fail("Should throw a missing apiai configuration type error");
          } catch (error) {
            expect(error.message).toEqual("Missing apiai configured type for entity 'entity1' (as WRONG_ENTITY).");
          }
        });
      });

      describe("regarding template language syntax mapping", function() {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it("transfers framework specific template literals to apiai specific one", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.arrayContaining([
              jasmine.objectContaining({
                data: jasmine.arrayContaining([{ text: "hello @ENTITIES_TYPE:entity1", userDefined: false }]),
              }),
            ])
          );
        });
      });

      describe("with custom entities", function() {
        beforeEach(async function(this: CurrentThisContext) {
          this.componentMetaData.configuration.entities = { ENTITIES_TYPE: ["@ENTITIES_TYPE"] };
          this.params.customEntityMapping = {
            ENTITIES_TYPE: [{ value: "entity1", synonyms: ["world", "earth"] }],
          };
          await this.execGenerator();
        });

        it("creates custom entities definition file in apiai entities build directory", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(
            `${this.params.buildDir}/apiai/entities/${Object.keys(this.componentMetaData.configuration.entities)[0]}.json`,
            jasmine.anything()
          );
        });

        it("generate valid custom entities definition for each type", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching("apiai/entities/"), {
            id: jasmine.anything(),
            name: jasmine.any(String),
            isOverridable: jasmine.any(Boolean),
            isEnum: jasmine.any(Boolean),
            automatedExpansion: jasmine.any(Boolean),
          });
        });

        it("writes configured custom entities definitions to separate custom entities synonym file", async function(this: CurrentThisContext) {
          Object.keys(this.params.customEntityMapping).forEach(customEntityMapping => {
            expect(fs.writeFileSync).toHaveBeenCalledWith(
              `${this.params.buildDir}/apiai/entities/${customEntityMapping}_entries_${this.params.language}.json`,
              this.params.customEntityMapping[customEntityMapping]
            );
          });
        });
      });
    });

    describe("without customEntityMapping", function() {
      it("will not create an entity definition file", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).not.toHaveBeenCalledWith(jasmine.stringMatching(`${this.params.buildDir}/apiai/entities/`), jasmine.anything());
      });
    });

    describe("with speakable intents", function() {
      describe("includes invokeGenericIntent", function(this: CurrentThisContext) {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it(`creates an invokeGenericIntent definition file`, async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/invokeGenericIntent.json`, jasmine.anything());
        });

        it(`includes an empty parameters array in the invokeGenericIntent definition file`, async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.objectContaining({ responses: jasmine.arrayContaining([jasmine.objectContaining({ parameters: [] }) as any]) })
          );
        });

        it(`transmit a valid invokeGenericIntent definition schema`, async function(this: CurrentThisContext) {
          this.expectValidIntentSchemaFor("invokeGenericIntent");
        });

        it("will not create an utterances file for invokeGenericIntent", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).not.toHaveBeenCalledWith(
            `${this.params.buildDir}/apiai/intents/invokeGenericIntent_usersays_${this.params.language}.json`,
            jasmine.any(Object)
          );
        });
      });

      describe("checking default intent handling", function() {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it("creates an __unhandled intent definition file", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/__unhandled.json`, jasmine.anything());
        });

        it("transmit a valid __unhandled definition", async function(this: CurrentThisContext) {
          const unhandledDefinition = {
            templates: [],
            userSays: [],
            id: jasmine.anything(),
            name: "__unhandled",
            auto: false,
            contexts: [],
            responses: [{ resetContexts: false, action: "input.unknown", affectedContexts: [], parameters: [], messages: [{ type: 0, speech: [] }] }],
            webhookUsed: true,
            webhookForSlotFilling: false,
            fallbackIntent: true,
            events: [],
          };
          expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), unhandledDefinition);
        });
      });

      describe("without utterances", function() {
        beforeEach(async function(this: CurrentThisContext) {
          this.params.intentConfigurations[0].utterances = [];
        });

        it("returns a did not specify warning", async function(this: CurrentThisContext) {
          await this.execGenerator();
          expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching("You did not specify any utterances for intent"));
        });

        it("will not creating an intent definition file for intents without utterances", async function(this: CurrentThisContext) {
          await this.execGenerator();
          expect(fs.writeFileSync).not.toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/helloWorld.json`, jasmine.anything());
        });

        describe("with GenericIntent", function() {
          beforeEach(async function(this: CurrentThisContext) {
            this.params.intentConfigurations[0].intent = GenericIntent.Help;
            await this.execGenerator();
          });

          it("returns a is a 'platform intent without utterances warning'", async function(this: CurrentThisContext) {
            expect(console.warn).toHaveBeenCalledWith(
              jasmine.stringMatching("is a platform intent without utterances. Update your platform utterances service or specify some utterances on your own.")
            );
          });
        });
      });

      describe("with utterances", function() {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it("creates an utterances schema definition file for helloWorld", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(
            `${this.params.buildDir}/apiai/intents/helloWorld_usersays_${this.params.language}.json`,
            jasmine.anything()
          );
        });

        it("contains matching intent utterances in utterances schema definition", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(
            jasmine.stringMatching(this.params.intentConfigurations[0].intent as string),
            jasmine.arrayContaining([
              jasmine.objectContaining({
                data: jasmine.arrayContaining(
                  this.params.intentConfigurations[0].utterances.map(utterance => {
                    return { text: utterance, userDefined: false };
                  })
                ),
              }),
            ])
          );
        });

        it("creates an valid utterances schema definition", async function(this: CurrentThisContext) {
          this.expectValidUtterancesSchemaFor(this.params.intentConfigurations[0].intent as string);
        });

        it("creates a intent schema definition file for each intent configuration", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration =>
            expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/${intentConfiguration.intent}.json`, jasmine.anything())
          );
        });

        it("generates a valid intent schema for each intent configuration", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration => this.expectValidIntentSchemaFor(intentConfiguration.intent));
        });
      });

      describe("with more then one intent", function() {
        beforeEach(async function(this: CurrentThisContext) {
          this.params.intentConfigurations.push({ intent: "secondOne", entities: [], utterances: ["I am the second one"] });
          await this.execGenerator();
        });

        it("creates a single intent definition file for each given intent", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration =>
            expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/${intentConfiguration.intent}.json`, jasmine.anything())
          );
        });

        it("creates a single utterances definition file for each given intent", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration =>
            expect(fs.writeFileSync).toHaveBeenCalledWith(
              `${this.params.buildDir}/apiai/intents/${intentConfiguration.intent}_usersays_${this.params.language}.json`,
              jasmine.anything()
            )
          );
        });

        it("generate a valid utterances definition for each given intent", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration => this.expectValidUtterancesSchemaFor(intentConfiguration.intent));
        });

        it("generate a valid intent definition for each given intent", async function(this: CurrentThisContext) {
          this.params.intentConfigurations.forEach(intentConfiguration => this.expectValidIntentSchemaFor(intentConfiguration.intent));
        });
      });

      describe("concerning the created bundle files", function() {
        beforeEach(async function(this: CurrentThisContext) {
          await this.execGenerator();
        });

        it("creates a valid package.json ", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.any(String), { version: "1.0.0" });
        });

        it("creates a package.json file in the apiai build directory", async function(this: CurrentThisContext) {
          expect(fs.writeFileSync).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/package.json`, jasmine.any(Object));
        });

        it("creates a bundle.zip file at the apiai build directory", async function(this: CurrentThisContext) {
          expect(fs.createWriteStream).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/bundle.zip`);
        });

        it("includes generated intents directory in bundle.zip file", async function(this: CurrentThisContext) {
          expect(this.archiverSpys.directory).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/`, "intents/");
        });

        it("includes generated entities directory in bundle.zip file", async function(this: CurrentThisContext) {
          expect(this.archiverSpys.directory).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/entities/`, "entities/");
        });

        it("includes generated package.json in bundle.zip file", async function(this: CurrentThisContext) {
          expect(this.archiverSpys.file).toHaveBeenCalledWith(`${this.params.buildDir}/apiai/package.json`, { name: "package.json" });
        });

        it("writes bundle.zip file to disk and finalize it", async function(this: CurrentThisContext) {
          expect(this.archiverSpys.finalize).toHaveBeenCalled();
        });
      });
    });

    describe("with unspeakable intents", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.params.intentConfigurations.push({ intent: 11, utterances: ["unspeakable utterance"], entities: [] });
        await this.execGenerator();
      });

      it("removes unspeakable generic intents from intent definition", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).not.toHaveBeenCalledWith(`${this.params.buildDir}/apiai/intents/11.json`, jasmine.anything());
      });
    });

    describe("without intents", function() {
      beforeEach(async function(this: CurrentThisContext) {
        this.params.intentConfigurations = [];
        await this.execGenerator();
      });

      it("generates default intents", async function(this: CurrentThisContext) {
        expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching("__unhandled"), jasmine.anything());
        expect(fs.writeFileSync).toHaveBeenCalledWith(jasmine.stringMatching("invokeGenericIntent"), jasmine.anything());
      });
    });
  });
});
