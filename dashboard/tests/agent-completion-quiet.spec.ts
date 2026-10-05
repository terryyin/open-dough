import { launchResultSchema } from "../src/launchOutcome.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
// Real installed closure/retirement, Git, receiver, storage and browser. Native and CI provider transports are synthetic.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
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
    const installed = path.join(workspace, ".agents/skills");
    const attention = readFileSync(
      path.join(installed, "dough-land/references/completion-attention.md"),
      "utf8",
    );
    expect(attention).toContain("dashboard-completion.md");
    const instruction = readFileSync(
      path.join(installed, "dough-land/references/dashboard-completion.md"),
      "utf8",
    );
    expect(instruction).toContain("final operation");
    expect(instruction).toContain("--outcome unfinished");
    expect(instruction).toContain("no message file");
    const land = readFileSync(
      path.join(installed, "dough-land/SKILL.md"),
      "utf8",
    );
    const wrapUp = readFileSync(
      path.join(installed, "dough-story-wrap-up/SKILL.md"),
      "utf8",
    );
    expect(land).toContain("references/dashboard-completion.md");
    expect(wrapUp).toContain(
      "../dough-land/references/dashboard-completion.md",
    );
    // The installed instructions must be loaded while the checkout/reference still exists.
    expect(land.indexOf("references/dashboard-completion.md")).toBeLessThan(
      land.indexOf(
        "node <installed>/dough-land/scripts/worktree-retirement.mjs retire",
      ),
    );
    expect(
      wrapUp.indexOf("../dough-land/references/dashboard-completion.md"),
    ).toBeLessThan(wrapUp.indexOf("## Commit final closure"));
    expect(land).toContain("surviving working directory before removal");
    expect(wrapUp).toContain("before either Trunk Mode `finish`");
    expect(
      readFileSync(
        path.join(
          installed,
          "dough-execute-plan/references/wrap-up-closure-publication.md",
        ),
        "utf8",
      ),
    ).toContain("../../dough-land/references/dashboard-completion.md");
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
          native.calls
            .slice(before)
            .filter((call) =>
              [
                "turn/interrupt",
                "thread/name/set",
                "turn/start",
                "thread/resume",
              ].includes(call.method),
            ),
        ).toEqual([]);
        await publishCommittedOrigin(page, {
          repoDir: origin.origin,
          revision: final,
          repository: "terryyin/open-dough",
        });
        await page.goto("/");
        const recent = parts(page)
          .recentSessions.getByRole("article")
          .filter({ hasText: native.threadId });
        await expect(recent).toContainText("Done");
        await expect(recent).toContainText("Native session is still working");
        await expect(recent.locator(".session-attention-message")).toHaveCount(
          0,
        );
        // Quiet completion has no explicit text; the native final report remains independently readable.
        const nativeSession = native;
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
