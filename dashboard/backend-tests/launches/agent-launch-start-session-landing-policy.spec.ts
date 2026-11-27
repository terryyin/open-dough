import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
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
import { landingHandoff } from "../../test-support/support/startSessionLandingContext.ts";
import { launchStoryIdentity } from "../../test-support/support/unattachedLaunchAssertions.ts";

test.use({ serverMode: "boundary" });

function readHandoff(
  home: string,
  workspace: string,
  id?: string,
  ...args: string[]
) {
  const env = {
    ...process.env,
    HOME: home,
    CODEX_THREAD_ID: id,
    CLAUDE_CODE_SESSION_ID: undefined,
    CURSOR_CONVERSATION_ID: undefined,
  };
  return execFileSync(
    process.execPath,
    [join(scripts(workspace), "session-landing-handoff.mjs"), ...args],
    { cwd: workspace, env, encoding: "utf8" },
  );
}

const childPublication = test.extend({
  liveServer: "synchronous delivery child blocks the mounted receiver",
});

childPublication(
  "an isolated blank Start can land its published story through managed delivery",
  async ({ dashboard, origin, codexProtocol }) => {
    if (!codexProtocol) throw new Error("No native fixture");
    await launch(dashboard, {
      ...makeMe.aLaunchRequest.adHoc().please(),
      host: "codex",
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
    const handoff = readHandoff(
      dashboard.home,
      workspace,
      codexProtocol.threadId,
    );
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
      expect(
        readHandoff(dashboard.home, workspace, codexProtocol.threadId),
      ).toBe("");
    } finally {
      writeFileSync(gitFile, ownedGit);
    }

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
  },
);
