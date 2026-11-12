import { finalReportText, readReportUntilText } from "../finalReportPages.ts";
import { sessionActions } from "../support/sessionEntryDisclosure.ts";
import { launchResultSchema } from "../../src/launchOutcome.ts";
import type { submitCompletion } from "../../server/completionReporting.ts";
// Real installed closure/retirement, Git, receiver, storage and browser. Native and CI provider transports are synthetic.
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import { test, expect, stored } from "../support/codexStart.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "../support/startOrigin.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectInstalledCompletionGuidance } from "../support/installedCompletionGuidance.ts";
import { withInstalledCompletionClosure } from "../support/installedCompletionClosure.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { keepFinalReport } from "../support/retainedReport.ts";
import {
  completionWriteFault,
  countedGit,
} from "../support/completionRecovery.ts";
import { failedCompletionRetry } from "../support/completionRecoveryFaults.ts";

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
    page,
    dashboard,
    origin,
    codexProtocol: native,
  }) => {
    // Story Branch Wrap Up runs real retirement, a write-fault retry, and a
    // duplicate report under the same default timeout as Land; CI workers and
    // parallel local load push that path over 30s before the final report open.
    if (closure === "Story Branch Wrap Up") test.setTimeout(60_000);
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
    const invalid = await rawRequest({
      url: `${dashboard.baseURL}/__agent-launch/completion`,
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "open-dough",
        host: "codex",
        reference: context.reference,
        outcome: "unfinished",
        message: "",
      }),
    });
    expect(invalid.status).toBe(400);
    expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
    const git = await countedGit(origin.machine);
    await withInstalledCompletionClosure(
      origin,
      workspace,
      closure,
      async (final) => {
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
        const receipt = JSON.parse(
          (
            await exec("bash", ["-c", command], {
              cwd: origin.machine,
              env: git.env,
            })
          ).stdout,
        ) as Awaited<ReturnType<typeof submitCompletion>>;
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
          const duplicate = await exec("bash", ["-c", command], {
            cwd: origin.machine,
            env: git.env,
          });
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
        await publishCommittedOrigin(page, {
          repoDir: origin.origin,
          revision: final,
          repository: "terryyin/open-dough",
        });
        await openUntilRead(page);
        const recent = parts(page)
          .recentlyDone.getByRole("article")
          .filter({ hasText: native.threadId });
        await expect(recent).toContainText("Done");
        await expect(recent).toContainText("Native session is still working");
        if (closure === "Trunk Wrap Up") {
          await expect(recent).toContainText("Native rename refused.");
          expect(stored(dashboard.home)[0]?.doneProblem).toContain(
            "Native rename refused.",
          );
          await expect(
            (await sessionActions(recent)).getByRole("button", {
              name: "Mark as done",
              exact: true,
            }),
          ).toBeVisible();
          nativeSession.renameError = undefined;
          const { delivery } = receipt;
          if (delivery === undefined) throw new Error("No delivery receipt");
          const retry = () =>
            rawRequest({
              url: `${dashboard.baseURL}/__agent-launch/completion`,
              method: "POST",
              headers: {
                Origin: dashboard.origin,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                makeMe.aCompletionSubmission
                  .reportingFor({ host: "codex", reference: context.reference })
                  .retrying(delivery)
                  .please(),
              ),
            });
          expect(JSON.parse((await retry()).body)).toEqual(receipt);
          await expect
            .poll(() => stored(dashboard.home)[0]?.doneProblem)
            .toBeUndefined();
          const afterRetry = native.calls.length;
          expect(JSON.parse((await retry()).body)).toEqual(receipt);
          expect(callsSince(afterRetry, "thread/name/set")).toEqual([]);
          expect(callsSince(before, "turn/interrupt")).toEqual([]);
        }
        expect(native.names.get(native.threadId)).toBe(
          `done-${record.session.name}`,
        );
        await expect(recent.locator(".session-attention-message")).toHaveCount(
          0,
        );
        keepFinalReport(nativeSession, workspace, "Done.");
        const beforeRead = native.calls.length;
        const reportText = finalReportText(page);
        await readReportUntilText(recent, reportText, "Done.");
        expect(
          native.calls
            .slice(beforeRead)
            .some(
              (call) =>
                call.method === "thread/read" &&
                call.params["includeTurns"] === true,
            ),
        ).toBe(true);
        expect(stored(dashboard.home)[0]?.doneAt).toBe(receipt.receivedAt);
        await reloadUntilRead(page);
        await expect(recent).toContainText("Done");
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
        expect(
          native.calls.filter((call) => call.method === "thread/name/set"),
        ).toEqual([]);
      },
    );
  });
