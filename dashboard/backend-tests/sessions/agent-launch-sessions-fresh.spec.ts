// A sessions ask marked fresh is answered only by an observation begun after
// it arrived (../../server/machineSessionObservation.ts): under a long reuse
// window, changed installed Codex options reach a fresh ask under a new
// revision, while an ordinary ask holding the prior revision is still answered
// unchanged from the held observation, read through the shared reader
// contract (../../src/machineSessionsRevision.ts).
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { offeredShape } from "../../src/commandOptions.ts";
import { machineSessionsReadSchema } from "../../src/machineSessionsRevision.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";

const staying = new AbortController().signal;

function codexOffering(flag: string) {
  const definition = makeMe.anOptionsDefinition
    .with({
      command: "dough-story-refinement",
      options: [makeMe.anOptionsEntry.with({ flag }).please()],
    })
    .please();
  const { records, ...rest } = makeMe.aMachineAnswer
    .offering({
      source: "open-dough",
      workflow: "refinement",
      host: "codex",
      ...offeredShape(definition),
    })
    .please();
  return { records, rest };
}

test("a fresh ask observes changed Codex options while an ordinary held ask is answered unchanged", async () => {
  vi.stubEnv("DOUGH_SESSIONS_REUSE_MS", "60000");
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  let installed = codexOffering("--option-a");
  let observationsStarted = 0;
  const observation = new MachineSessionObservation(
    () => {
      observationsStarted += 1;
      return Promise.resolve(installed);
    },
    () => Promise.resolve(["unchanged catalog and machine documents"]),
  );
  const ask = async (held: string | undefined, fresh: boolean) =>
    machineSessionsReadSchema.parse(
      JSON.parse(
        (
          await observation.answerFor(
            { audience: "overview", held, fresh },
            staying,
          )
        ).serialized,
      ),
    );
  const codexFlags = (answer: Awaited<ReturnType<typeof ask>>) =>
    "definitions" in answer
      ? answer.definitions
          .filter((definition) => definition.host === "codex")
          .flatMap((definition) =>
            "options" in definition
              ? definition.options.map(({ flag }) => flag)
              : [],
          )
      : [];

  const first = await ask(undefined, false);
  const held = first.revision;
  expect(codexFlags(first)).toEqual(["--option-a"]);

  installed = codexOffering("--option-b");

  expect(await ask(held, false)).toEqual({ revision: held, unchanged: true });
  expect(observationsStarted).toBe(1);

  const fresh = await ask(held, true);
  expect(observationsStarted).toBe(2);
  expect(fresh.revision).not.toBe(held);
  expect(codexFlags(fresh)).toEqual(["--option-b"]);
});
