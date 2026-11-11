// Builds a one-shot native-journey fixture from explicit repository facts,
// then prints its coordinates as JSON. Every journey starts from Ready queued
// A and B with the project's durable setup and command.
//
// one-shot-result: a queued trunk holding a product file `notes.txt` and what
// managed delivery needs to observe CI: `.planning/open-dough.json` selects
// the project's CI command `scripts/ci-check.mjs`, which reports success for
// whatever revision the checked remote branch holds. No backlog entry names
// the requested work.
//
// one-shot-queued: the same project whose queued story B, described as adding
// a line to `notes.txt` with a one-slice plan, sits between story A and its
// unfinished sibling B2 in the same seed.
//
// one-shot-review: the one-shot-result project.
//
// one-shot-refinement: the one-shot-queued project whose sibling B2 is
// described but neither refined nor recorded, for refinement as one-shot work
// in a preparation workspace on branch `prep/native-one-shot`.
//
// one-shot-refinement-auto-land: the one-shot-refinement project.
//
// one-shot-escalation: the one-shot-result project plus the notes tool from
// git-publication-native-one-shot-escalation-fixture.mjs.
//
// one-shot-default-main: the one-shot-result project, worked on in the
// integration checkout itself as the default checkout on `main`.
//
// one-shot-auto-land: the one-shot-result project.
//
// one-shot-auto-land-blocked and one-shot-established: the one-shot-queued
// project.
//
// Usage: node git-publication-native-one-shot-fixture.mjs <source-dir>
//   <journey> <parent>
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import { renderSlicePlan } from "./published-plan.mjs";
import { escalationProductFiles } from "./git-publication-native-one-shot-escalation-fixture.mjs";
import {
  readyStoryState,
  storyA,
  storyB,
  storyPlanPath,
} from "./queued-repository.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import {
  queuedReadyStartupRepository,
  readyStartupFiles,
} from "./startup-command-files.mjs";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import {
  queuedRepositoryWithSiblingB2,
  seedWithSiblingB2,
  storyB2,
} from "../../src/skills/dough-execute-plan/scripts/one-shot-queued-repository.mjs";

const [, journey, parent] = process.argv.slice(2);
const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const isRefinement = journey.startsWith("one-shot-refinement");
const isDefaultMain = journey === "one-shot-default-main";
const isQueued =
  [
    "one-shot-queued",
    "one-shot-auto-land-blocked",
    "one-shot-established",
  ].includes(journey) || isRefinement;
const seedB = `.planning/${splitHref(storyB.href).path}`;
const planB = `.planning/${storyPlanPath(storyB)}`;
// The developer who queued work commits it from the originating checkout.
const developer = { name: "Dana Developer", email: "dana@example.test" };

// Ready queued A and B with the project's durable setup and command.
const readyTrunk = queuedReadyStartupRepository({ queued: [storyA, storyB] });

// Story B's concrete trivial outcome and its one-slice plan; selected for
// refinement, sibling B2 gains an outcome of its own but stays unrefined.
const queuedStoryFiles = () => ({
  ...seedWithSiblingB2({
    storyB: "Add the line 'Story B line' to the end of notes.txt.",
    ...(isRefinement && {
      storyB2:
        "Release notes should also credit Story B2: add the line 'Story B2 line' to the end of notes.txt.",
    }),
  }),
  [planB]: `${renderSlicePlan(
    makeMe.aSlicePlan
      .with({
        slices: [
          makeMe.aPlanSlice
            .with({
              index: 1,
              name: "Add the Story B line",
              proof: "notes.txt ends with the line 'Story B line'.",
            })
            .please(),
        ],
      })
      .please(),
    { preamble: "# Story B plan" },
  )}\nAppend the line 'Story B line' to notes.txt.\n`,
});

// What managed delivery needs to observe CI: `.planning/open-dough.json`
// selects the project's CI command, which reports success for whatever
// revision the checked remote branch holds.
const ciFiles = {
  "scripts/ci-check.mjs": `// The project's CI check: every push to the checked branch passes.
import { execFileSync } from "node:child_process";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation === "discover") {
  const [sha] = execFileSync("git", ["ls-remote", "origin", \`refs/heads/\${request.check.branch}\`], { encoding: "utf8" }).split(/\\s/);
  const attempts = sha ? [{ runId: sha, attemptId: "1", sha, outcome: "success" }] : [];
  process.stdout.write(JSON.stringify({ attempts }));
} else {
  process.stdout.write(JSON.stringify({ unavailable: "the check never fails" }));
}
`,
  ".planning/open-dough.json": `${JSON.stringify(
    makeMe.projectCiSettings
      .with({ ciAdapter: ["node", "scripts/ci-check.mjs"] })
      .please(),
  )}\n`,
};

const startingTrunk = (
  isQueued ? queuedRepositoryWithSiblingB2(readyTrunk) : readyTrunk
).withRevision("notes", {
  message: "add notes and the CI check",
  files: {
    "notes.txt": "Release notes\n",
    ...ciFiles,
    ...(isQueued && queuedStoryFiles()),
    ...(journey === "one-shot-escalation" &&
      escalationProductFiles(readyStartupFiles["scripts/command.js"])),
  },
  // B stays Ready over its described outcome and plan; B2 stays unrefined.
  storyStates: isQueued ? [readyStoryState(storyB)] : [],
  ...(isQueued && { committer: developer }),
});
const { fixture, origin, integration } = await materializeRepository(
  startingTrunk.please(),
  { parent },
);
if (isQueued) {
  git(integration, "config", "user.name", developer.name);
  git(integration, "config", "user.email", developer.email);
}

process.stdout.write(
  JSON.stringify({
    root: fixture,
    origin,
    integration,
    workspace: isDefaultMain ? integration : join(fixture, "native-one-shot"),
    branch: isDefaultMain
      ? "main"
      : isRefinement
        ? "prep/native-one-shot"
        : "exec/native-one-shot",
    journey,
    base: git(origin, "rev-parse", "refs/heads/main"),
    ...(isRefinement
      ? {
          identity: storyB2.identity,
          sibling: storyB.identity,
          seed: seedB,
        }
      : {}),
    ...(isQueued && !isRefinement
      ? {
          identity: storyB.identity,
          sibling: storyB2.identity,
          seed: seedB,
          plan: planB,
        }
      : {}),
  }),
);
