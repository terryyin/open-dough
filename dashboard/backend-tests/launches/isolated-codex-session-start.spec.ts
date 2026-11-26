// An isolated Start establishes its Codex worktree and sends the ordered
// first input through the real host adapter. The dialog's workflow and
// shared reporting instructions are in
// ../../../e2e/launches/agent-launch-start-session-isolated.spec.ts.
import path from "node:path";
import { beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { shellCommand } from "../../src/sessionCapabilities.ts";
import {
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import {
  established,
  isolatedSession,
  recordStarts,
  sessionBlock,
} from "../../test-support/support/startSessionLanding.ts";

let origin: StartOrigin;
let home: string;
let native: FakeCodex;
let starts: ReturnType<typeof recordStarts>;

beforeEach(async ({ onTestFinished }) => {
  origin = await startOrigin(queuedReadyRepository().please(), {
    host: "codex",
  });
  onTestFinished(() => {
    vi.unstubAllEnvs();
    origin.cleanup();
  });
  home = path.join(origin.machine, "home");
  native = await installFakeCodex(origin.machine, process.env.PATH ?? "", true);
  onTestFinished(async () => {
    launchHost("codex")?.close?.();
    await native.close();
    expect(native.sockets.size).toBe(0);
  });
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", home);
  onTestFinished(mountProjectConfiguration("production"));
  starts = recordStarts(origin, "codex");
});

test("an isolated Codex Start opens its admitted worktree with the ordered first input", async () => {
  const source = makeMe.aPublishedSource.openDough.please();
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const instruction = "Tidy the README wording";
  const slug = "tidy-the-readme-wording";
  const reportingOrigin = "http://127.0.0.1:9";
  const attempt = makeMe.anAcceptedAttempt
    .adHocStart(
      { workspace: "isolated", landing: "review" },
      { host: "codex", instruction },
    )
    .reportingTo(reportingOrigin)
    .please();
  const owned = new OwnedAttempts();
  const own = owned.own(attempt.request, attempt);

  await settleAttempt(owned, own, (current, notes) =>
    attemptRun(source, current, {
      notes,
      progress: new StartProgress(),
      doneMarks: { reported: () => undefined },
      native: launchHost,
    }),
  );

  expect(own.attempt.outcome).toMatchObject({ kind: "launched" });
  const admitted = await admittedStory(origin, instruction);
  expect(admitted.revision).not.toBe(before);
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    admitted.revision,
    "codex",
  );
  const reportingDirectory = path.join(
    home,
    ".open-dough/dashboard/reporting",
    attempt.id,
  );
  const landingContext = path.join(reportingDirectory, "landing-context.json");
  const command = shellCommand([
    "node",
    path.join(reportingDirectory, "dashboard-completion.mjs"),
    "--origin",
    reportingOrigin,
    "--source",
    source.id,
    "--host",
    "codex",
    "--reference",
    attempt.id,
  ]);
  const [record] = await keptRecords(source.id);
  expect(record?.establishedSession).toEqual(session);
  expect(record?.request).toMatchObject({
    storyIdentity: admitted.identity,
    reporting: {
      origin: reportingOrigin,
      reference: attempt.id,
      command,
      landingContext,
    },
  });
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(
      isolatedAdmissionFlags(origin.project, slug, "codex"),
    ),
  ]);
  expect(established(origin.project, slug)).toEqual({
    branch: `codex/${slug}`,
    revision: admitted.revision,
  });
  expect(
    native.calls.find(({ method }) => method === "thread/start")?.params,
  ).toMatchObject({ cwd: session.workspace });
  const turns = native.calls.filter(({ method }) => method === "turn/start");
  expect(turns).toHaveLength(1);
  const input = turns[0]?.params["input"] as { text: string }[] | undefined;
  const [block, reporting, ...developer] = (input?.[0]?.text ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  const lines = reporting?.split("\n") ?? [];
  expect(lines.slice(0, 5)).toEqual([
    "Dashboard reporting context:",
    `- project: ${source.id}`,
    "- host: codex",
    `- launch reference: ${attempt.id}`,
    `- reporting command: ${command}`,
  ]);
  expect(lines).toHaveLength(6);
  expect(lines[5]).toContain(
    `--landing-context ${shellCommand([landingContext])}`,
  );
  expect(developer).toEqual([`Taken story: ${admitted.identity}`, instruction]);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    admitted.revision,
  );
});
