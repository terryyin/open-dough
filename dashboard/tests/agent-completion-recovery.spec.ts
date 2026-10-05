// Actual Git closure/retirement precedes faults; persistence, installed CLI and page are real.
import { readFileSync } from "node:fs";
import type { CompletionReceipt } from "../src/completionReport.ts";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { withInstalledCompletionClosure } from "./support/installedCompletionClosure.ts";
import {
  reportingChild,
  recordOperation,
  completionProxy,
  completionWriteFault,
  countedGit,
} from "./support/completionRecovery.ts";
import {
  unavailableCompletion,
  observeCompletionFaults,
} from "./support/completionRecoveryFaults.ts";
import { observeLaterCompletionIntent } from "./support/completionRecoveryIntent.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";

test("retired closure retries unavailable receiver, real write fault and lost acknowledgment without repeating work", async ({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  test.setTimeout(120000);
  if (native === undefined) throw new Error("No native fixture");
  expect(
    (
      await launch(dashboard, {
        source: "open-dough",
        host: "codex",
        workflow: "execution",
        identity: queuedIdentity,
        title: queuedTitle,
      })
    ).status,
  ).toBe(200);
  const record = stored(dashboard.home)[0];
  const context = record?.request.reporting;
  const workspace = record?.start?.workspace;
  if (record === undefined || context === undefined || workspace === undefined)
    throw new Error("No real context");
  const git = await countedGit(origin.machine);
  await withInstalledCompletionClosure(
    origin,
    workspace,
    "Story Branch Wrap Up",
    async (final) => {
      const gitBefore = readFileSync(git.log, "utf8");
      expect(gitBefore).toMatch(/push/);
      expect(gitBefore).toMatch(/worktree remove/);
      const nativeControls = () =>
        native.calls
          .filter((call) =>
            [
              "turn/start",
              "thread/resume",
              "turn/interrupt",
              "thread/name/set",
            ].includes(call.method),
          )
          .map((call) => call.method);
      const nativeBefore = nativeControls().length;
      await publishCommittedOrigin(page, {
        repoDir: origin.origin,
        revision: final,
        repository: "terryyin/open-dough",
      });
      await page.goto("/");
      await dashboard.close();
      const saved = await unavailableCompletion(
        context,
        origin.machine,
        dashboard.home,
        git.env,
      );
      const fault = completionWriteFault(origin.machine);
      const restarted = await startDashboardServer({
        mode: "preview",
        prebuilt: builtDashboardDir,
        machine: origin.machine,
        github: dashboard.github,
        codexProtocol: native,
        extraEnv: fault.env,
      });
      const proxy = await completionProxy(dashboard.origin, restarted.baseURL);
      let receipt: CompletionReceipt | undefined;
      try {
        receipt = await observeCompletionFaults({
          page,
          receiver: restarted,
          record,
          cwd: origin.machine,
          env: git.env,
          retry: saved.retry,
          delivery: saved.delivery,
          proxy,
          fault,
        });
        await observeLaterCompletionIntent({
          page,
          receiver: restarted,
          context,
          record,
          cwd: origin.machine,
          env: git.env,
          retry: saved.retry,
          pending: saved.pending,
          receipt,
          proxy,
        });
      } finally {
        await proxy.close();
        await restarted.close();
      }
      // Restart retains the old receipt, newer message and manual disposition.
      const last = stored(dashboard.home)[0];
      const again = await startDashboardServer({
        mode: "preview",
        prebuilt: builtDashboardDir,
        machine: origin.machine,
        github: dashboard.github,
        codexProtocol: native,
        port: Number(new URL(dashboard.origin).port),
      });
      try {
        const result = await reportingChild(
          saved.retry,
          origin.machine,
          git.env,
        );
        expect(result.ok).toBe(true);
        expect(JSON.parse(result.stdout)).toEqual(receipt);
        expect(stored(again.home)[0]?.completion?.receipt).toBe(
          last?.completion?.receipt,
        );
        expect(stored(again.home)[0]?.doneAt).toBe(last?.doneAt);
        await recordOperation(again, "deleteRecord", [
          "open-dough",
          record.session,
        ]);
        const deleted = await reportingChild(
          saved.retry,
          origin.machine,
          git.env,
        );
        expect(deleted.ok).toBe(false);
        expect(deleted.stdout).toBe("");
        await expect(
          recordOperation(again, "keepRecord", ["open-dough", record]),
        ).rejects.toThrow("The reporting session was deleted");
        expect(stored(again.home)).toHaveLength(0);
        expect(readFileSync(git.log, "utf8")).toBe(gitBefore);
        // Automatic and manual Done share native naming; successful receipt retries
        // do not repeat native work.
        expect(nativeControls().slice(nativeBefore)).toEqual([
          "thread/name/set",
          "thread/name/set",
        ]);
      } finally {
        await again.close();
      }
    },
    git.env,
  );
});
