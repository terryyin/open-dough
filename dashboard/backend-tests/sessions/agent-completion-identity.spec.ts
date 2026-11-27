// A completion report closes only its own launch's session, a duplicate
// delivery answers its receipt without a store write, and an older retry
// cannot close a newer report. Each launch's installed reporting script runs
// in process; its one request reaches production completion admission and
// delivery over a private machine home.
import { randomUUID } from "node:crypto";
import {
  chmodSync,
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
import { submissionSchema } from "../../server/completionAdmission.ts";
import { reportingContext } from "../../server/completionReporting.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import {
  installPublisherScripts,
  reportInstalled,
} from "../support/installedPublisher.ts";

const origin = "http://127.0.0.1:4173";
// A kept session that neither a completion nor a Done has closed.
const open = { receipt: undefined, doneAt: undefined };

// A private machine home with its catalog, its dashboard directory, and a
// workspace holding the installed reporting scripts where a Codex launch
// workspace has them.
function privateWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-completion-identity-"));
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
  const dashboard = path.join(root, "home", ".open-dough", "dashboard");
  return { root, workspace, dashboard };
}

// A kept Codex launch on `sessionId` whose installed reporting script, run as
// its reporting command, reports to `reported`.
async function keptLaunch(
  { workspace }: ReturnType<typeof privateWorkspace>,
  sessionId: string,
  reported = vi.fn(),
) {
  const instruction = `Complete bounded work in ${sessionId}.`;
  const accepted = makeMe.anAcceptedAttempt
    .adHoc({ host: "codex", instruction })
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
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction, title: instruction })
    .inCodexSession({ sessionId })
    .reportingThrough(reporting)
    .please();
  await bindRecord("open-dough", record);
  // `node <script> ...argv`, as the host's shell splits the reporting command.
  const [, script = "", ...argv] = Array.from(
    reporting.command.matchAll(/'((?:[^']|'\\'')*)'/g),
    ([, part = ""]) => part.replaceAll("'\\''", "'"),
  );
  return {
    session: record.session,
    // The kept session's completion receipt and Done time.
    closing: async () => {
      const kept = await keptSession("open-dough", record.session);
      if (kept === undefined) throw new Error("No kept session");
      return { receipt: kept.completion?.receipt, doneAt: kept.doneAt };
    },
    report: async (...more: string[]) =>
      completionReceiptSchema.parse(
        await reportInstalled(script, [...argv, ...more], { reported }),
      ),
    retry: async (pending: string) =>
      completionReceiptSchema.parse(
        await reportInstalled(script, ["--retry", pending], { reported }),
      ),
    // The submission the script retained for `receipt`'s delivery.
    pending: ({ delivery }: { delivery?: string | undefined }) => {
      if (delivery === undefined) throw new Error("No delivery");
      return path.join(path.dirname(script), `completion-${delivery}.json`);
    },
    receipts: async () =>
      (await keptAttempts())?.find((entry) => entry.id === accepted.id)
        ?.completionReceipts ?? [],
  };
}

test("an older launch's report reaches only its session, and its duplicates write nothing", async () => {
  const home = privateWorkspace();
  const reported = vi.fn();
  const older = await keptLaunch(home, "older-native-session", reported);
  const newer = await keptLaunch(home, "later-native-session");
  const receipt = await older.report("--outcome", "completed");
  expect(receipt.session?.sessionId).toBe(older.session.sessionId);
  expect((await older.closing()).receipt).toBe(receipt.receipt);
  expect(await newer.closing()).toEqual(open);
  expect(reported.mock.calls).toEqual([["open-dough", receipt]]);

  const pending = older.pending(receipt);
  const attemptsFile = path.join(home.dashboard, "launch-attempts.json");
  const recordsFile = path.join(home.dashboard, "agent-launches.json");
  const attempts = readFileSync(attemptsFile, "utf8");
  const records = readFileSync(recordsFile, "utf8");
  chmodSync(home.dashboard, 0o500);
  try {
    expect(await older.retry(pending)).toEqual(receipt);
  } finally {
    chmodSync(home.dashboard, 0o700);
  }
  expect(readFileSync(attemptsFile, "utf8")).toBe(attempts);
  expect(readFileSync(recordsFile, "utf8")).toBe(records);

  // A developer's reopen competes with a fresh delivery after its reservation.
  await setRecordDoneAt("open-dough", older.session, undefined);
  // The retained submission, as a new delivery without its sender's origin.
  const retained = JSON.parse(readFileSync(pending, "utf8")) as Record<
    string,
    unknown
  >;
  delete retained["origin"];
  const body = JSON.stringify({
    ...submissionSchema.parse(retained),
    delivery: randomUUID(),
  });
  const post = async () =>
    completionReceiptSchema.parse(
      await (
        await fetch(`${origin}/__agent-launch/completion`, {
          method: "POST",
          headers: { Origin: origin, "Content-Type": "application/json" },
          body,
        })
      ).json(),
    );
  const lock = `${recordsFile}.lock`;
  mkdirSync(lock);
  const first = post();
  await expect.poll(async () => (await older.receipts()).length).toBe(2);
  const reopened = setRecordDoneAt("open-dough", older.session, undefined);
  const duplicate = post();
  rmSync(lock, { recursive: true });
  const [fresh, duplicated] = await Promise.all([first, duplicate, reopened]);
  expect(duplicated).toEqual(fresh);
  expect(fresh.delivery).not.toBe(receipt.delivery);
  expect((await older.closing()).doneAt).toBeUndefined();

  // After a developer's Done, a retry keeps that Done time.
  const manual = new Date().toISOString();
  await setRecordDoneAt("open-dough", older.session, manual);
  await older.retry(pending);
  expect((await older.closing()).doneAt).toBe(manual);
  expect(await newer.closing()).toEqual(open);
});

test("an older quiet retry cannot close a newer unfinished report whose record write failed", async () => {
  const home = privateWorkspace();
  const launch = await keptLaunch(home, "reporting-thread");
  const recordsLock = path.join(home.dashboard, "agent-launches.json.lock");
  // Holds the record store once the report has reserved its receipt, while
  // each clock reading passes the writer's ten-second deadline, however late
  // it set it, so that record write fails unacknowledged.
  const failingRecordWrite = async (
    report: Promise<unknown>,
    reserved: number,
  ) => {
    mkdirSync(recordsLock);
    const refused = expect(report).rejects.toThrow(
      "Completion delivery was not acknowledged",
    );
    await expect
      .poll(async () => (await launch.receipts()).length)
      .toBe(reserved);
    let now = Date.now();
    const later = vi.spyOn(Date, "now").mockImplementation(() => {
      now += 11_000;
      return now;
    });
    try {
      await refused;
    } finally {
      later.mockRestore();
      rmSync(recordsLock, { recursive: true });
    }
    const receipt = (await launch.receipts())[reserved - 1];
    if (receipt === undefined) throw new Error("No reserved receipt");
    return receipt;
  };
  const original = await failingRecordWrite(
    launch.report("--outcome", "completed"),
    1,
  );
  const olderPending = launch.pending(original);
  const text = "Retirement is held. Resolve ownership before continuing.";
  const message = path.join(home.root, "newer-issue.txt");
  writeFileSync(message, text);
  const newer = await failingRecordWrite(
    launch.report("--outcome", "unfinished", "--message-file", message),
    2,
  );
  const newerPending = launch.pending(newer);
  expect(readFileSync(newerPending, "utf8")).toContain(text);
  expect(await launch.closing()).toEqual(open);

  expect(await launch.retry(olderPending)).toEqual(original);
  expect(await launch.closing()).toEqual(open);
  const recovered = await launch.retry(newerPending);
  expect(recovered).toMatchObject({ outcome: "unfinished", message: text });
  const unfinished = { ...open, receipt: recovered.receipt };
  expect(await launch.closing()).toEqual(unfinished);
  await launch.retry(olderPending);
  expect(await launch.closing()).toEqual(unfinished);
});
