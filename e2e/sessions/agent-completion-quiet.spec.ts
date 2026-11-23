import { launchResultSchema } from "../../dashboard/src/launchOutcome.ts";
import type { submitCompletion } from "../../dashboard/server/completionReporting.ts";
// Real installed closure/retirement, Git, receiver and storage; no browser.
// Native and CI provider transports are synthetic. The Recently done
// observations of a quiet completion (Done, no Startup recovery or attention
// message, the final report, Done after a
// reload, the refusal text and Mark as done) are owned by
// agent-completion-quiet-done.spec.ts.
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  queuedIdentity,
  queuedTitle,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectInstalledCompletionGuidance } from "../../dashboard/test-support/support/installedCompletionGuidance.ts";
import { withInstalledCompletionClosure } from "../../dashboard/test-support/support/installedCompletionClosure.ts";
import {
  completionWriteFault,
  countedGit,
  postCompletion,
} from "../../dashboard/test-support/support/completionRecovery.ts";
import { failedCompletionRetry } from "../../dashboard/test-support/support/completionRecoveryFaults.ts";

test.use({
  extraEnv: async ({ origin }, use) => {
    await use(completionWriteFault(origin.machine).env);
  },
});

const exec = promisify(execFile);
for (const closure of [
  "Land",
  "Story Branch Wrap Up",
  "Trunk Wrap Up",
] as const)
  test(`${closure} retires real accepted work before installed quiet reporting; no native interruption`, async ({
    dashboard,
    origin,
    codexProtocol: native,
  }) => {
    if (native === undefined) throw new Error("Missing native fixture");
    const nativeSession = native;
    // The native calls of `methods` made since call `from`.
    const callsSince = (from: number, ...methods: string[]) =>
      native.calls.slice(from).filter((call) => methods.includes(call.method));
    const accepted = await launch(dashboard, {
      source: "open-dough",
      host: "codex",
      workflow: "execution",
      identity: queuedIdentity,
      title: queuedTitle,
    });
    expect(accepted.status).toBe(200);
    expect(launchResultSchema.parse(JSON.parse(accepted.body)).kind).toBe(
      "launched",
    );
    const record = stored(dashboard.home)[0];
    const workspace = record?.start?.workspace;
    const context = record?.request.reporting;
    if (
      record === undefined ||
      workspace === undefined ||
      context === undefined
    )
      throw new Error("No recorded launch context");
    expectInstalledCompletionGuidance(workspace);
    expect(record.doneAt).toBeUndefined(); // Launch/native Working is not success.
    const invalid = await postCompletion(dashboard.origin, {
      source: "open-dough",
      host: "codex",
      reference: context.reference,
      outcome: "unfinished",
      message: "",
    });
    expect(invalid.status).toBe(400);
    expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
    const git = await countedGit(origin.machine);
    // The installed reporting command, run with the counted Git.
    const report = (command: string) =>
      exec("bash", ["-c", command], { cwd: origin.machine, env: git.env });
    await withInstalledCompletionClosure(
      origin,
      workspace,
      closure,
      async () => {
        expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined(); // Even actual retirement is not success reporting.
        const before = native.calls.length;
        const gitBefore = readFileSync(git.log, "utf8");
        let command = `${context.command} --outcome completed`;
        if (closure === "Story Branch Wrap Up") {
          expect(gitBefore).toMatch(/push/);
          expect(gitBefore).toMatch(/worktree remove/);
          command = await failedCompletionRetry(
            context,
            origin.machine,
            dashboard.home,
            completionWriteFault(origin.machine),
            git.env,
          );
        }
        if (closure === "Trunk Wrap Up")
          nativeSession.renameError = {
            code: -32000,
            message: "Native rename refused.",
          };
        const receipt = JSON.parse((await report(command)).stdout) as Awaited<
          ReturnType<typeof submitCompletion>
        >;
        expect(receipt).toMatchObject({
          state: "recorded",
          outcome: "completed",
          message: "",
          reference: context.reference,
          session: { host: "codex", sessionId: native.threadId },
        });
        // These durable facts are visible immediately when the installed child receives its receipt.
        expect(stored(dashboard.home)[0]?.completion?.receipt).toBe(
          receipt.receipt,
        );
        expect(stored(dashboard.home)[0]?.doneAt).toBe(receipt.receivedAt);
        expect(
          callsSince(before, "turn/interrupt", "turn/start", "thread/resume"),
        ).toEqual([]);
        // The native rename follows the receipt.
        await expect
          .poll(() =>
            callsSince(before, "thread/name/set").map((call) => call.params),
          )
          .toEqual([
            { threadId: native.threadId, name: `done-${record.session.name}` },
          ]);
        if (closure === "Story Branch Wrap Up") {
          const nativeBeforeRetry = native.calls.length;
          const duplicate = await report(command);
          expect(JSON.parse(duplicate.stdout)).toEqual(receipt);
          expect(
            callsSince(
              nativeBeforeRetry,
              "thread/name/set",
              "turn/interrupt",
              "turn/start",
              "thread/resume",
            ),
          ).toEqual([]);
          expect(readFileSync(git.log, "utf8")).toBe(gitBefore);
        }
        if (closure === "Trunk Wrap Up") {
          // The refusal follows the rename call; the entry text and Mark as
          // done are proved by agent-completion-quiet-done.spec.ts.
          await expect
            .poll(() => stored(dashboard.home)[0]?.doneProblem)
            .toContain("Native rename refused.");
          nativeSession.renameError = undefined;
          const { delivery } = receipt;
          if (delivery === undefined) throw new Error("No delivery receipt");
          const retry = () =>
            postCompletion(
              dashboard.origin,
              makeMe.aCompletionSubmission
                .reportingFor({ host: "codex", reference: context.reference })
                .retrying(delivery)
                .please(),
            );
          expect(JSON.parse((await retry()).body)).toEqual(receipt);
          await expect
            .poll(() => stored(dashboard.home)[0]?.doneProblem)
            .toBeUndefined();
          const afterRetry = native.calls.length;
          expect(JSON.parse((await retry()).body)).toEqual(receipt);
          expect(callsSince(afterRetry, "thread/name/set")).toEqual([]);
          expect(callsSince(before, "turn/interrupt")).toEqual([]);
        }
        expect(stored(dashboard.home)[0]?.doneAt).toBe(receipt.receivedAt);
        expect(native.names.get(native.threadId)).toBe(
          `done-${record.session.name}`,
        );
      },
      git.env,
      context.landingContext,
      async () => {
        // A retained increment has a real landing, but its story is still Taken.
        await exec("bash", ["-c", `${context.command} --outcome completed`], {
          cwd: origin.machine,
        });
        expect(stored(dashboard.home)[0]?.landing).toBeDefined();
        expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
        expect(callsSince(0, "thread/name/set")).toEqual([]);
      },
    );
  });
