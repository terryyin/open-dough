import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { markDoneAnswerSchema } from "../../src/doneMark.ts";
import {
  deleteRecord,
  launch,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import { expect, stored, test } from "../../test-support/support/codexStart.ts";
import {
  quote,
  reportingChild,
} from "../../test-support/support/completionRecovery.ts";
import {
  capturedPublicationSchema,
  commit,
  git,
  scripts,
} from "../../test-support/support/launchLanding.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import { keptRecord } from "../../test-support/support/startSessionLandingCapture.ts";
import {
  landingHandoff,
  readCodexHandoff as readHandoff,
} from "../../test-support/support/startSessionLandingContext.ts";
import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";

test.use({ serverMode: "boundary" });

test("a blank Start hands Automatically land to its native conversation alone", async ({
  dashboard,
  codexProtocol,
}) => {
  if (!codexProtocol) throw new Error("No native fixture");
  await launch(dashboard, {
    ...makeMe.aLaunchRequest.adHoc({ host: "codex" }).please(),
    policy: { workspace: "default-checkout", landing: "auto-land" },
  });
  const record = stored(dashboard.home)[0];
  if (!record) throw new Error("No bound launch");
  const { session, file, reporting } = landingHandoff(record);
  expect(
    codexProtocol.calls.some(({ method }) => method === "turn/start"),
  ).toBe(false);
  const handoff = (id?: string, ...args: string[]) =>
    readHandoff(dashboard.home, session.workspace, id, ...args);
  const bound = handoff(codexProtocol.threadId);
  expect(bound).toContain("- landing: auto-land");
  expect(bound).toContain(`Taken story: ${launchStoryIdentity(record)}`);
  expect(bound).toContain(`Landing context: ${file}`);
  expect(bound).toContain(
    `Dashboard reporting context:\n- project: ${record.request.source}\n- host: codex\n- launch reference: ${reporting.reference}\n- reporting command: ${reporting.command}`,
  );
  expect(handoff("other-conversation")).toBe("");
  expect(handoff()).toBe("");
  expect(handoff("other-conversation", codexProtocol.threadId)).toBe("");

  const launches = join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const parked = `${launches}.parked`;
  renameSync(launches, parked);
  try {
    expect(handoff(codexProtocol.threadId)).toBe(bound);
  } finally {
    renameSync(parked, launches);
  }
  const done = await markDone(dashboard, {
    source: record.request.source,
    host: "codex",
    session: codexProtocol.threadId,
  });
  expect(
    markDoneAnswerSchema.parse(JSON.parse(done.body)).record.doneAt,
  ).toBeDefined();
  expect(handoff(codexProtocol.threadId)).toBe("");
});

const childPublication = test.extend({
  liveServer: "synchronous delivery child blocks the mounted receiver",
});

childPublication(
  "an isolated blank Start can land its published story through managed delivery",
  async ({ dashboard, origin, codexProtocol }) => {
    if (!codexProtocol) throw new Error("No native fixture");
    await launch(dashboard, {
      ...makeMe.aLaunchRequest.adHoc({ host: "codex" }).please(),
      policy: { workspace: "isolated", landing: "auto-land" },
    });
    const record = stored(dashboard.home)[0];
    if (!record) throw new Error("No bound launch");
    const { session, file, reporting } = landingHandoff(record);
    const { workspace, branch, startingRevision: base } = session;
    const identity = launchStoryIdentity(record);
    expect(workspace).not.toBe(origin.project);
    expect(
      codexProtocol.calls.some(({ method }) => method === "turn/start"),
    ).toBe(false);
    const probeHandoff = () =>
      readHandoff(dashboard.home, workspace, codexProtocol.threadId);
    const handoff = probeHandoff();
    expect(handoff).toContain("- landing: auto-land");
    expect(handoff).toContain(`Taken story: ${identity}`);
    expect(handoff).toContain(`- startingRevision: ${base}`);
    const landingContext = handoff.match(/^Landing context: (.+)$/m)?.[1];
    const command = handoff.match(/^- reporting command: (.+)$/m)?.[1];
    if (!landingContext || !base || !command)
      throw new Error("Missing landing or reporting handoff");
    expect(landingContext).toBe(file);
    expect(command).toBe(reporting.command);
    expect(await originMain(origin)).toBe(base);

    const replacement = join(origin.machine, "replacement");
    git(origin.machine, "init", "--initial-branch", branch, replacement);
    const gitFile = join(workspace, ".git");
    const ownedGit = readFileSync(gitFile, "utf8");
    writeFileSync(gitFile, `gitdir: ${join(replacement, ".git")}\n`);
    try {
      expect(git(workspace, "rev-parse", "--show-toplevel")).toBe(
        realpathSync(workspace),
      );
      expect(git(workspace, "symbolic-ref", "--short", "HEAD")).toBe(branch);
      expect(probeHandoff()).toBe("");
    } finally {
      writeFileSync(gitFile, ownedGit);
    }
    expect(probeHandoff()).toBe(handoff);

    const candidate = commit(workspace, "verified-isolated-session.txt");
    const publication = capturedPublicationSchema.parse(
      JSON.parse(
        execFileSync(
          process.execPath,
          [
            join(scripts(workspace), "execution-increment-delivery.mjs"),
            "deliver",
            "--mode",
            "trunk",
            "--authority",
            "publish",
            "--workspace",
            workspace,
            "--branch",
            branch,
            "--previously-published-base",
            base,
            "--target-ref",
            `refs/heads/${session.target}`,
            "--remote",
            session.remote,
            "--repo",
            "terryyin/open-dough",
            "--host",
            "codex",
            "--landing-context",
            landingContext,
          ],
          {
            cwd: workspace,
            encoding: "utf8",
            env: {
              ...process.env,
              DOUGH_CI_MAILBOX_ROOT: join(origin.machine, "mailboxes"),
            },
          },
        ),
      ),
    );
    expect(publication).toMatchObject({
      ok: true,
      suffixBase: base,
      receipt: { sha: candidate },
    });
    expect(await originMain(origin)).toBe(candidate);
    expect(
      (await keptRecord(dashboard, reporting.reference))?.landing,
    ).toMatchObject({
      identity,
      reference: reporting.reference,
      base,
      revision: candidate,
    });

    const message = "Story wrap-up is pending.";
    const messageFile = join(origin.machine, "pending-wrap-up.txt");
    writeFileSync(messageFile, message);
    const result = await reportingChild(
      `${command} --outcome unfinished --message-file ${quote(messageFile)}`,
      origin.machine,
    );
    expect(result.ok, result.stderr).toBe(true);
    expect(
      completionReceiptSchema.parse(JSON.parse(result.stdout)),
    ).toMatchObject({
      state: "recorded",
      session: { host: "codex", sessionId: codexProtocol.threadId },
      reference: reporting.reference,
      outcome: "unfinished",
      message,
    });
    Object.assign(codexProtocol, { readError: true });
    const deleted = await deleteRecord(dashboard, {
      source: record.request.source,
      host: "codex",
      session: codexProtocol.threadId,
    });
    expect(JSON.parse(deleted.body)).toEqual({ kind: "deleted" });
    expect(probeHandoff()).toBe("");
  },
);

for (const [landing, instruction] of [
  ["auto-land", "Summarize the project"],
  ["review", undefined],
] as const) {
  test(`a ${instruction ? "non-blank" : "blank"} ${landing} Start keeps no ready handoff`, async ({
    dashboard,
  }) => {
    await launch(dashboard, {
      ...makeMe.aLaunchRequest
        .adHoc({
          host: "codex",
          ...(instruction === undefined ? {} : { instruction }),
        })
        .please(),
      policy: { workspace: "isolated", landing },
    });
    const { session, establishedSession } = stored(dashboard.home)[0] ?? {};
    if (!session || !establishedSession) throw new Error("No settled Start");
    expect(
      readHandoff(
        dashboard.home,
        establishedSession.workspace,
        session.sessionId,
      ),
    ).toBe("");
  });
}
