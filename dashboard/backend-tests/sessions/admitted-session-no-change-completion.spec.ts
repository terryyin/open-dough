// An ad hoc Codex Start admitted through production `attemptRun` closes with
// no change through the installed wrap-up children, run from the borrowed
// default checkout given as an alias. The installed reporting script runs in
// process (../support/installedReporting.ts) against the kept record.
import { existsSync, symlinkSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { finishAdmittedClaim } from "../../test-support/support/admittedSessionCompletion.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { admitCodexLaunch } from "../support/admittedCodexLaunch.ts";
import {
  reportInstalled,
  reportingInvocation,
} from "../support/installedReporting.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let native: FakeCodex;
let unmount: () => void;

beforeAll(async () => {
  const prepared = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, prepared);
  } finally {
    prepared.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository, { host: "codex" });
  native = await installFakeCodex(
    origin.machine,
    process.env["PATH"] ?? "",
    true,
  );
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
});

afterEach(async () => {
  native.release();
  await native.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

test("ordinary no-change wrap-up closes the admitted claim and keeps the borrowed checkout", async () => {
  const head = git(origin.project, "rev-parse", "HEAD");
  const admitted = await admitCodexLaunch(
    source,
    origin,
    "Confirm the current behavior",
  );
  const { claim, identity, reporting, landingContext } = admitted;
  const base = claim.publishedSha;

  const nativeAlias = path.join(origin.machine, "borrowed-checkout-alias");
  symlinkSync(origin.project, nativeAlias, "dir");
  const final = await finishAdmittedClaim(admitted, base, nativeAlias);
  expect(existsSync(claim.workspace)).toBe(false);
  expect(git(origin.project, "rev-parse", "HEAD")).toBe(head);
  expect(
    await origin.originGit(
      "show",
      `main:.planning/done/${doneRecordFileName(identity)}`,
    ),
  ).toContain(identity);
  const session = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    reporting.reference,
  );
  expect(
    JSON.parse(await origin.originGit("show", `main:${session}`)),
  ).toMatchObject({
    sessionId: reporting.reference,
    story: identity,
    ranges: [{ base, candidate: final }],
  });
  expect(
    existsSync(
      path.join(path.dirname(landingContext), "first-landing-expectation.json"),
    ),
  ).toBe(false);

  const tip = (await origin.originGit("rev-parse", "main")).trim();
  const { script, argv } = reportingInvocation(reporting.command);
  expect(
    await reportInstalled(script, [...argv, "--outcome", "completed"], {
      reported: vi.fn(),
    }),
  ).toMatchObject({
    reference: reporting.reference,
    outcome: "completed",
    message: "",
    state: "recorded",
  });
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(tip);
  // The admission and the closure each run real Git children.
}, 20_000);
