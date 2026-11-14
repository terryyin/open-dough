// Real scoped and Default executions as preconditions for runner lifetime
// journeys. Their card/model UI stays in the launch and scope journeys.
import { realpathSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";
import type { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import { sessionKey } from "../../src/sessionReference.ts";
import { readCursorRunnerLastHeld } from "../../server/hosts/cursor/runnerPaths.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts, sessionEntriesIn } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { recordedScope } from "./cursorScopeAssertions.ts";
import { keptRecords } from "./cursorSessionRecovery.ts";
import { expect } from "./cursorStart.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import type { StartOrigin } from "./startOrigin.ts";

type HeldExecution = {
  readonly story: typeof storyA;
  readonly sessionId: string;
  readonly model?: string;
};

export async function openHeldCursorExecutions(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  cursor: FakeCursor,
  executions: readonly HeldExecution[],
): Promise<void> {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  const sharedBefore = cursor.sharedConfig();
  for (const { story, sessionId, model } of executions) {
    cursor.queueCreateChatId(sessionId);
    const request = makeMe.aLaunchRequest
      .executing({
        source: "open-dough",
        host: "cursor",
        identity: story.identity,
        title: story.title,
      })
      .withInstruction("Implement the selected slice.");
    if (model !== undefined) request.requestingModel(model);
    const launched = await launch(dashboard, request.please());
    expect(launched.status).toBe(200);
    expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
    await expect
      .poll(() => readCursorRunnerLastHeld(dashboard.home))
      .toContain(sessionKey({ host: "cursor", sessionId }));
    const record = keptRecords(dashboard.home).find(
      (each) => each.session.sessionId === sessionId,
    );
    const client = cursor
      .attaches()
      .find((each) => each.sessionId === sessionId);
    if (record?.session.host !== "cursor" || client === undefined)
      throw new Error("Missing a held Cursor execution.");
    expect(record.request).toMatchObject({
      identity: story.identity,
      workflow: "execution",
    });
    expect(record.firstInput?.state).toBe("confirmed");
    expect(realpathSync(client.cwd)).toBe(
      realpathSync(record.session.continuation.workspace),
    );
    expect(record.start?.workspace).toBe(record.session.continuation.workspace);
    if (model === undefined) {
      expect(record.session.continuation.configScope).toBeUndefined();
    } else {
      const scope = recordedScope(record);
      expect(client.env["CURSOR_CONFIG_DIR"]).toBe(scope);
      expect(JSON.parse(cursor.configIn(scope)) as unknown).toMatchObject({
        model,
      });
    }
  }
  expect(cursor.sharedConfig()).toBe(sharedBefore);
  await openUntilRead(page);
  await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(
    executions.length,
  );
}
