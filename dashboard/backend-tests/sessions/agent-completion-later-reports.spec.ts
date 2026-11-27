// Later reports and the developer's Done stay apart from an old quiet
// receipt, whose replay answers it and changes nothing newer. The installed
// reporting script runs in process; its one request reaches production
// completion admission and delivery over a private machine home.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { submissionSchema } from "../../server/completionAdmission.ts";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { reportingContext } from "../../server/completionReporting.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import {
  deleteRecord,
  keptRecords,
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  completionReceiptSchema,
  type CompletionReceipt,
} from "../../src/completionReport.ts";
import { queuedIdentity as identity } from "../../test-support/support/queuedStories.ts";
import {
  installPublisherScripts,
  reportInstalled,
} from "../support/installedPublisher.ts";

const origin = "http://127.0.0.1:4173";
const title = "Prepare the queued start";

// A kept, landed tracked Codex execution on a private machine home, whose
// readable published closure lets a quiet report close it and whose
// workspace was retired after its reporting script was installed. Its first
// quiet report lost its receipt and was answered on retry: that is the old
// receipt and its retained delivery.
async function afterOldReceipt() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-later-reports-"));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  vi.stubEnv("HOME", path.join(root, "home"));
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  onTestFinished(mountProjectConfiguration("production"));
  const workspace = path.join(root, "workspace");
  installPublisherScripts(
    installedSkillPath(
      "codex",
      { path: workspace, shown: workspace },
      "dough-execute-plan",
      "scripts",
    ),
  );
  const repository = path.join(root, "closure-repository");
  mkdirSync(repository);
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository }).toString().trim();
  git("init", "-b", "main");
  writeRevisionFiles(repository, { backlog: {} });
  git("add", ".");
  git("-c", "user.email=a@b", "-c", "user.name=a", "commit", "-m", "closed");
  const revision = git("rev-parse", "HEAD");
  git("update-ref", "refs/remotes/origin/main", revision);

  const accepted = makeMe.anAcceptedAttempt
    .executing({ identity, title, host: "codex" })
    .reportingTo(origin)
    .withId(randomUUID())
    .please();
  const prepared = await reportingContext(accepted, {
    path: workspace,
    shown: workspace,
  });
  if (prepared === undefined) throw new Error("No reporting prepared");
  const { reporting } = prepared;
  await keepAttempt({ ...accepted, reporting });
  const record = {
    ...makeMe.aLaunchRecord
      .executing({ identity, title })
      .inCodexSession({ sessionId: "tracked-native-session" })
      .onStoryBranch({ workspace, branch: "codex/tracked" })
      .reportingThrough(reporting)
      .withFirstInput({ state: "awaiting" })
      .please(),
    landing: makeMe.aLaunchLanding
      .capturedFrom({ repository, identity })
      .comparing({ base: revision, revision })
      .forLaunch(reporting.reference)
      .please(),
  };
  await bindRecord("open-dough", record);
  rmSync(workspace, { recursive: true, force: true });
  // `node <script> ...argv`, as the host's shell splits the reporting command.
  const [, script = "", ...argv] = Array.from(
    reporting.command.matchAll(/'((?:[^']|'\\'')*)'/g),
    ([, part = ""]) => part.replaceAll("'\\''", "'"),
  );
  const reported = vi.fn();
  // Reports `outcome` with `text` from a file removed once it returns.
  const report = (outcome: string, text = "", { lostReceipt = false } = {}) => {
    const file = path.join(root, `${randomUUID()}.txt`);
    writeFileSync(file, text);
    const more = text === "" ? [] : ["--message-file", file];
    const argvFor = [...argv, "--outcome", outcome, ...more];
    return reportInstalled(script, argvFor, { reported }, { lostReceipt })
      .then((answer) => completionReceiptSchema.parse(answer))
      .finally(() => {
        rmSync(file);
      });
  };
  const unacknowledged = async (outcome: string, text = "") => {
    // The retained submission the unacknowledged report names.
    const message = await report(outcome, text, { lostReceipt: true }).then(
      () => "",
      (error: unknown) => String(error),
    );
    return /Retained completion: (.+)/.exec(message)?.[1] ?? "";
  };
  const retry = async (retained: string, doneMarks = { reported }) =>
    completionReceiptSchema.parse(
      await reportInstalled(script, ["--retry", retained], doneMarks),
    );
  const pending = await unacknowledged("completed");
  const receipt = await retry(pending);
  return {
    record,
    receipt,
    pending,
    report,
    unacknowledged,
    retry,
    replayOld: (doneMarks = { reported }) => retry(pending, doneMarks),
    // The kept session's completion receipt and message, and its Done time.
    closing: async () => {
      const { completion, doneAt } =
        (await keptSession("open-dough", record.session)) ?? {};
      return {
        receipt: completion?.receipt,
        message: completion?.message,
        doneAt,
      };
    },
  };
}

const closedBy = (
  { receipt, message }: CompletionReceipt,
  doneAt?: string,
) => ({ receipt, message, doneAt });

test("a fresh unfinished report replaces automatic Done, and a fresh quiet one's Done survives old replays", async () => {
  const launch = await afterOldReceipt();
  expect(await launch.closing()).toEqual(
    closedBy(launch.receipt, launch.receipt.receivedAt),
  );
  const text = "Remaining ownership decision is held before release.";
  const unfinished = await launch.report("unfinished", text);
  expect(unfinished).toMatchObject({ outcome: "unfinished", message: text });
  expect(await launch.closing()).toEqual(closedBy(unfinished, undefined));
  // A fresh quiet report moves automatic Done to its own receipt.
  const quiet = await launch.report("completed");
  expect(quiet.delivery).not.toBe(launch.receipt.delivery);
  const moved = closedBy(quiet, quiet.receivedAt);
  expect(await launch.closing()).toEqual(moved);
  expect(await launch.replayOld()).toEqual(launch.receipt);
  // A restarted receiver (fresh Done collaborator) hands on no old Done.
  const restarted = { reported: vi.fn() };
  expect(await launch.replayOld(restarted)).toEqual(launch.receipt);
  expect(restarted.reported).not.toHaveBeenCalled();
  expect(await launch.closing()).toEqual(moved);
});

test("a newer attention report whose receipt was lost recovers its exact message without its file", async () => {
  const launch = await afterOldReceipt();
  const text = "Publication accepted. Inspect the migration before release.";
  const pending = await launch.unacknowledged("completed", text);
  expect(await launch.closing()).toMatchObject({
    message: text,
    doneAt: undefined,
  });
  const newer = await launch.retry(pending);
  expect(newer).toMatchObject({ outcome: "completed", message: text });
  expect(newer.delivery).not.toBe(launch.receipt.delivery);
  expect(await launch.replayOld()).toEqual(launch.receipt);
  expect(await launch.closing()).toEqual(closedBy(newer, undefined));
});

test("a developer's Done stays through old replays and a fresh unfinished report and its retry", async () => {
  const launch = await afterOldReceipt();
  await launch.report("completed", "Inspect the migration.");
  const manual = new Date().toISOString();
  await setRecordDoneAt("open-dough", launch.record.session, manual);
  expect(await launch.replayOld()).toEqual(launch.receipt);
  expect((await launch.closing()).doneAt).toBe(manual);
  const remaining = "Further work is held. Resolve the remaining decision.";
  const pending = await launch.unacknowledged("unfinished", remaining);
  expect(await launch.closing()).toMatchObject({
    message: remaining,
    doneAt: manual,
  });
  const held = await launch.retry(pending);
  expect(held).toMatchObject({ outcome: "unfinished", message: remaining });
  expect(await launch.replayOld()).toEqual(launch.receipt);
  const kept = closedBy(held, manual);
  expect(await launch.closing()).toEqual(kept);
  // A second receiver restart answers the old receipt and changes neither.
  expect(await launch.replayOld({ reported: vi.fn() })).toEqual(launch.receipt);
  expect(await launch.closing()).toEqual(kept);
});

test("a retry with a changed message, or after its record is deleted, is refused", async () => {
  const launch = await afterOldReceipt();
  const retained = JSON.parse(readFileSync(launch.pending, "utf8")) as Record<
    string,
    unknown
  >;
  delete retained["origin"];
  const changed = submissionSchema.parse({
    ...retained,
    message: "Changed old completion",
  });
  await expect(
    deliverCompletion(changed, origin, { reported: vi.fn() }),
  ).rejects.toMatchObject({ status: 409 });
  expect(await launch.closing()).toEqual(
    closedBy(launch.receipt, launch.receipt.receivedAt),
  );
  // Once deleted, neither a retry nor a late binding recreates the record.
  expect(await deleteRecord("open-dough", launch.record.session)).toBe(true);
  await expect(launch.replayOld()).rejects.toThrow();
  await expect(bindRecord("open-dough", launch.record)).rejects.toThrow(
    "The reporting session was deleted",
  );
  expect(await keptRecords("open-dough")).toEqual([]);
});
