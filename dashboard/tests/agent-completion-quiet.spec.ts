import { launchResultSchema } from "../src/launchOutcome.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
// Real installed closure/retirement, Git, receiver, storage and browser. Native and CI provider transports are synthetic.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { expectInstalledCompletionGuidance } from "./support/installedCompletionGuidance.ts";
import { withInstalledCompletionClosure } from "./support/installedCompletionClosure.ts";

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
    test.setTimeout(120000);
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
    await withInstalledCompletionClosure(
      origin,
      workspace,
      closure,
      async (final) => {
        expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined(); // Even actual retirement is not success reporting.
        const before = native.calls.length;
        if (closure === "Trunk Wrap Up")
          nativeSession.renameError = {
            code: -32000,
            message: "Native rename refused.",
          };
        const receipt = JSON.parse(
          (
            await exec(
              "bash",
              ["-c", `${context.command} --outcome completed`],
              { cwd: origin.machine },
            )
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
        await publishCommittedOrigin(page, {
          repoDir: origin.origin,
          revision: final,
          repository: "terryyin/open-dough",
        });
        await page.goto("/");
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
            recent.getByRole("button", { name: "Mark as done", exact: true }),
          ).toBeVisible();
          nativeSession.renameError = undefined;
          const retry = () =>
            rawRequest({
              url: `${dashboard.baseURL}/__agent-launch/completion`,
              method: "POST",
              headers: {
                Origin: dashboard.origin,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                source: "open-dough",
                host: "codex",
                reference: context.reference,
                delivery: receipt.delivery,
                outcome: "completed",
                message: "",
              }),
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
        // Quiet completion has no explicit text; the native final report remains independently readable.
        nativeSession.history = [
          {
            id: "native-final",
            status: "completed",
            items: [
              {
                type: "agentMessage",
                id: "native-reply",
                phase: "final_answer",
                text: "## STORY WRAP-UP COMPLETE",
                memoryCitation: null,
                delivery: null,
                questions: null,
              },
            ],
          },
        ];
        const beforeRead = native.calls.length;
        await recent.getByRole("button", { name: "Read final report" }).click();
        await expect(
          page
            .getByRole("region", { name: "Final report" })
            .locator(".session-final-report"),
        ).toHaveText("## STORY WRAP-UP COMPLETE");
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
        await page.reload();
        await expect(recent).toContainText("Done");
      },
    );
  });
