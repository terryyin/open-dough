// Through this process's production `gh` path (../../server/ghRead.ts), its
// request owner of each case's own and a real CLI `gh` answering from a fake
// GitHub: once a directed wait has passed, one call goes first, and the new
// limit it meets answers the queued requests as held back at once without
// asking GitHub; a wait met reading one project holds back another project's
// reads, and a revision check and the optional profile setting file, held
// back, fail their reads without asking GitHub, the setting file never
// reading as absent. The admission rules themselves, with explicit clock inputs:
// ./authenticated-read-admission.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { disconnectGh, execGh, GhFailure, runGh } from "../../server/ghRead.ts";
import { agentSettingsTextAt } from "../../server/recordsBesideBacklog.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import {
  rateLimitedAnswer,
  rawFileAnswer,
  type OriginAnswer,
} from "../../test-support/originAnswers.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

const source = makeMe.aPublishedSource.openDough.please();
const otherProject = makeMe.aPublishedSource.pygardon.please();
const revision = "c3".repeat(20);
const contentOf = (file: string) => [
  "api",
  `repos/${source.repository}/contents/${file}?ref=${revision}`,
];
const read = (file: string) =>
  execGh(contentOf(file), new AbortController().signal);

const test = base.extend<{ github: FakeGitHub }>({
  // eslint-disable-next-line no-empty-pattern
  github: async ({}, use) => {
    const root = mkdtempSync(path.join(tmpdir(), "dough-resumption-"));
    const github = await startFakeGitHub();
    const gh = installFakeGh(root, { transport: "cli" });
    const restore = withRestoredEnv(fakeGhEnv(gh, github.url));
    try {
      await use(github);
    } finally {
      disconnectGh();
      await endFakeGh(gh);
      restore();
      await github.close();
      rmSync(root, { recursive: true, force: true });
    }
  },
});

test("after a directed wait, three requests send one call first, and its new limit answers the other two as held back without asking GitHub", async ({
  github,
}) => {
  const answers: OriginAnswer[] = [
    rateLimitedAnswer(429, { "Retry-After": "1" }),
    rateLimitedAnswer(429, { "Retry-After": "600" }),
  ];
  github.serve(everyRepository, () =>
    Promise.resolve(answers.shift() ?? rawFileAnswer("# seed\n")),
  );
  const limited = await read("seed-0.md");
  expect(limited.failure).toMatchObject({
    kind: "rate-limited",
    waitSeconds: 1,
  });
  await new Promise((resolve) => setTimeout(resolve, 1_100));

  const settled = await Promise.all(
    ["seed-1.md", "seed-2.md", "seed-3.md"].map(read),
  );
  expect(github.calls).toHaveLength(2);
  const kinds = settled.map(({ failure }) => failure?.kind).sort();
  expect(kinds).toEqual(["held-back", "held-back", "rate-limited"]);
  for (const { failure } of settled) {
    expect((failure as { waitSeconds: number }).waitSeconds).toBeGreaterThan(
      590,
    );
  }
});

// A wait GitHub directed, met by this process reading `seed-0.md`.
async function waitMet(github: FakeGitHub) {
  github.serve(everyRepository, () =>
    Promise.resolve(rateLimitedAnswer(429, { "Retry-After": "600" })),
  );
  expect((await read("seed-0.md")).failure).toMatchObject({
    kind: "rate-limited",
  });
}

test("a wait met reading one project holds back another project's read without asking GitHub", async ({
  github,
}) => {
  await waitMet(github);
  const otherRead = await execGh(
    [
      "api",
      `repos/${otherProject.repository}/contents/seed.md?ref=${revision}`,
    ],
    new AbortController().signal,
  );
  expect(otherRead.failure).toMatchObject({ kind: "held-back" });
  expect(github.calls).toHaveLength(1);
});

test("a profile setting file held back fails its read, never reading as absent, without asking GitHub", async ({
  github,
}) => {
  await waitMet(github);
  const settings = await agentSettingsTextAt((file) =>
    runGh(contentOf(file), new AbortController().signal),
  ).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(settings).toBeInstanceOf(GhFailure);
  expect((settings as GhFailure).reason).toMatchObject({ kind: "held-back" });
  expect(github.calls).toHaveLength(1);
});

test("a revision check held back fails its read without asking GitHub", async ({
  github,
}) => {
  await waitMet(github);
  const checks = new RevisionChecks({
    tracked: new Set(),
    scope: () => Promise.resolve(undefined),
  });
  const check = await checks.check(source, new AbortController().signal).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect((check as GhFailure).reason).toMatchObject({ kind: "held-back" });
  expect(github.calls).toHaveLength(1);
});
