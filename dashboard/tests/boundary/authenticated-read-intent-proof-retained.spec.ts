// Proof's file version after a dashboard upgrade (../../server/pinnedTexts.ts,
// ../../server/intentProofRead.ts): a feature listing an older dashboard
// retained on this machine without blob shas never decides which file version
// an observation was on. A later process reading a revision that touched only
// the proof folder reads the feature folder's tree once more, answers every
// listed feature's blob, and later untouched revisions reuse that listing.
// Development-environment boundaries over real HTTP with the synthetic `gh`
// count the `gh` calls each process made (../retainedAnswersJourney.ts).

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { gitBlobSha } from "../listingAnswers.ts";
import {
  filesFor,
  madeBy,
  modified,
  named,
  settingsPath,
  type Files,
} from "../revisionReuseOrigin.ts";
import {
  asked,
  daysAgo,
  entryFile,
  expect,
  onMachine,
  published,
  read,
  repository,
  test,
} from "../retainedAnswersJourney.ts";

const featureDirectory = "e2e_test/features";
const proofDirectory = "e2e_test/proof";
const features = {
  [`${featureDirectory}/recall/note.feature`]: "Feature: Note\n",
  [`${featureDirectory}/review/card.feature`]: "Feature: Card\n",
};
const proofFile = (run: number) => `${proofDirectory}/run-${run}.json`;
const proofText = (run: number) =>
  `${JSON.stringify({ version: 1, observations: [], run })}\n`;

// The project at a revision whose proof folder holds runs 1 through `runs`.
const filesWith = (label: string, runs: number): Files => ({
  ...filesFor(label),
  [settingsPath]: JSON.stringify({
    intent: {
      locations: [
        { path: featureDirectory, kind: "gherkin", proof: proofDirectory },
      ],
    },
  }),
  ...features,
  ...Object.fromEntries(
    [...Array(runs).keys()].map((n) => [proofFile(n + 1), proofText(n + 1)]),
  ),
});

const fileBlobs = Object.fromEntries(
  Object.entries(features).map(([path, text]) => [path, gitBlobSha(text)]),
);

const proofOf = (body: unknown) =>
  (body as { locations: { proof?: { fileBlobs?: unknown } }[] }).locations[0]
    ?.proof;

// The feature listing at `revision` as an older dashboard retained it: its
// entries without blob shas, under the key it used, and nothing under the
// key that carries them.
function retainedWithoutShas(machine: string, revision: string) {
  const older = `${featureDirectory}\0tree`;
  const current = `${older}\0sha`;
  const kept = entryFile(machine, revision, current);
  expect(existsSync(kept)).toBe(true);
  const held = JSON.parse(readFileSync(kept, "utf8")) as { text: string };
  const shaless = (
    JSON.parse(held.text) as { path: string; type: string; sha?: string }[]
  ).map((entry) => ({ path: entry.path, type: entry.type }));
  expect(shaless.length).toBeGreaterThan(0);
  rmSync(entryFile(machine, revision, current), { force: true });
  writeFileSync(
    entryFile(machine, revision, older),
    JSON.stringify({
      key: `${repository}\0${revision}\0${older}`,
      text: JSON.stringify(shaless),
    }),
  );
}

test.describe("authenticated Intent proof file version after a dashboard upgrade (development environment)", () => {
  test("a feature listing retained without blob shas is read again, answers every listed feature's blob, and is reused at a later untouched revision", async ({
    github,
    machine,
  }) => {
    const label = "proof-retained";
    const [a, b, c] = [named("e1"), named("e2"), named("e3")];
    const project = published(label, a, named("e9"));
    project.publication.revisions.set(a, filesWith(label, 1));
    project.serve(github);
    const locationsAt = (revision: string) =>
      `&revision=${revision}&intent=locations`;

    const first = await onMachine(machine, github, async (server) => {
      expect((await read(server, "")).status).toBe(200);
      return read(server, locationsAt(a));
    });
    expect(first.status).toBe(200);
    expect(proofOf(first.body)).toMatchObject({ fileBlobs });
    retainedWithoutShas(machine, a);

    project.movedTo(b, filesWith(label, 2), [
      { ...madeBy("e4", [modified(proofFile(2))]), committedAt: daysAgo(1) },
    ]);
    const second = await onMachine(machine, github, (server) =>
      asked(github, async () => {
        expect((await read(server, "")).status).toBe(200);
        return read(server, locationsAt(b));
      }),
    );
    expect(second.result.status).toBe(200);
    // The feature folder's tree once more, and the touched proof folder's.
    expect(second.calls.filter((call) => call === "tree")).toEqual([
      "tree",
      "tree",
    ]);
    expect(proofOf(second.result.body)).toMatchObject({ fileBlobs });

    project.movedTo(c, filesWith(label, 3), [
      { ...madeBy("e5", [modified(proofFile(3))]), committedAt: daysAgo(1) },
    ]);
    const third = await onMachine(machine, github, (server) =>
      asked(github, async () => {
        expect((await read(server, "")).status).toBe(200);
        return read(server, locationsAt(c));
      }),
    );
    expect(third.result.status).toBe(200);
    expect(third.calls.filter((call) => call === "tree")).toEqual(["tree"]);
    expect(proofOf(third.result.body)).toMatchObject({ fileBlobs });
  });
});
