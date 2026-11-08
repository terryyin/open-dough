// While an open launch record of a story remains on this machine, every
// workflow's start of that story is refused with `session-open` until the
// session is marked done or its record deleted. An unreadable launch-record
// file refuses story starts. Proven over raw HTTP against the real acceptance
// boundary (`../../server/agentLaunches.ts`). Continuation ownership is
// `./agent-launch-open-session-continue.spec.ts`.

import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  sessionOpen,
  unreadableLaunchRecords,
} from "../../server/launchAttemptConflicts.ts";
import {
  accept,
  attempts,
  deleteRecord,
  markDone,
} from "../../tests/agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { machineHome, seedStore } from "../../tests/machineLaunchRecords.ts";
import {
  keepLaunchRecords,
  keepLaunchStore,
} from "../../tests/support/launchStore.ts";
import {
  answerOf,
  nothingStarted,
  openSessionRequest as request,
} from "./openStorySessionAcceptance.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "../../tests/support/startOrigin.ts";

// The requested story's execution, still open in the session it names.
const openExecution = () =>
  makeMe.aLaunchRecord.executing({
    identity: queuedIdentity,
    title: queuedTitle,
  });

test.describe("an open story session on this machine", () => {
  let origin: StartOrigin;
  let server: DashboardServer;
  let push: PushHold;

  test.beforeEach(async () => {
    origin = await startOrigin(queuedReadyRepository().please());
    server = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      doneRenameWaitMs: 100,
    });
    push = origin.holdPushes();
    // These cases need Takes to publish so settled launches can prove acceptance
    // after an open session closes; refusals still assert nothing was held.
    push.release();
  });

  test.afterEach(async () => {
    push.release();
    await server.close();
    origin.cleanup();
  });

  const keepOpen = (open: LaunchRecord) => {
    keepLaunchRecords(machineHome(origin.machine), [open]);
  };

  const noneStarted = (keptAttempts = true) =>
    nothingStarted(origin, server, push, keptAttempts);

  test("refuses every workflow's start until marked done, and leaves other starts free", async () => {
    const sessionId = "aaaaaaaa-0000-4000-8000-000000000001";
    keepOpen(openExecution().inClaudeSession({ sessionId }).please());
    server.claudeScenario("launched");

    for (const workflow of ["execution", "refinement"] as const) {
      expect(await answerOf(accept(server, { ...request, workflow }))).toEqual(
        sessionOpen,
      );
    }
    expect(
      await answerOf(
        accept(server, {
          ...request,
          workflow: "refinement",
          policy: {
            tracking: "one-shot",
            workspace: "isolated",
            landing: "review",
          },
        }),
      ),
    ).toEqual(sessionOpen);
    await noneStarted();

    const otherStory = {
      ...request,
      identity: "SEED-B#b",
      title: "Story B",
    };
    expect(await answerOf(accept(server, otherStory))).toMatchObject({
      kind: "accepted",
    });
    await expect
      .poll(async () => (await attempts(server)).at(-1)?.outcome?.kind, {
        timeout: 30_000,
      })
      .toBe("launched");

    expect(
      await answerOf(
        accept(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
        }),
      ),
    ).toMatchObject({ kind: "accepted" });
    await expect
      .poll(async () => (await attempts(server)).at(-1)?.outcome?.kind, {
        timeout: 30_000,
      })
      .toBe("launched");

    // Another project's open record of the same identity does not block once
    // this project's session is marked done.
    keepLaunchStore(machineHome(origin.machine), {
      "open-dough": [openExecution().inClaudeSession({ sessionId }).please()],
      "other-project": [
        makeMe.aLaunchRecord
          .executing({
            identity: queuedIdentity,
            title: queuedTitle,
            source: "other-project",
          })
          .inClaudeSession({
            sessionId: "bbbbbbbb-0000-4000-8000-000000000002",
          })
          .please(),
      ],
    });
    expect(await answerOf(accept(server, request))).toEqual(sessionOpen);
    expect(
      await markDone(server, { source: "open-dough", session: sessionId }),
    ).toMatchObject({ status: 200 });
    writeFileSync(
      path.join(
        server.home,
        ".open-dough",
        "dashboard",
        "launch-attempts.json",
      ),
      "{}",
    );
    expect(await answerOf(accept(server, request))).toMatchObject({
      kind: "accepted",
    });
  });

  test("refuses a start for an open Codex or Cursor session until its record is deleted", async () => {
    server.claudeScenario("launched");
    keepOpen(
      openExecution()
        .inCodexSession({ sessionId: "codex-open-session-1" })
        .please(),
    );
    expect(await answerOf(accept(server, request))).toEqual(sessionOpen);
    expect(
      await answerOf(accept(server, { ...request, host: "codex" })),
    ).toEqual(sessionOpen);
    await noneStarted();
    expect(
      await deleteRecord(server, {
        source: "open-dough",
        session: "codex-open-session-1",
        host: "codex",
      }),
    ).toMatchObject({ status: 200 });

    const cursorSession = "cccccccc-0000-4000-8000-000000000003";
    keepOpen(
      openExecution()
        .inCursorSession({
          sessionId: cursorSession,
          continuation: {
            workspace: "/tmp",
            args: ["agent", "--resume", cursorSession],
          },
        })
        .please(),
    );
    expect(await answerOf(accept(server, request))).toEqual(sessionOpen);
    expect(
      await answerOf(accept(server, { ...request, host: "cursor" })),
    ).toEqual(sessionOpen);
    await noneStarted();
    expect(
      await deleteRecord(server, {
        source: "open-dough",
        session: cursorSession,
        host: "cursor",
      }),
    ).toMatchObject({ status: 200 });
    expect(await answerOf(accept(server, request))).toMatchObject({
      kind: "accepted",
    });
  });

  test("refuses a story start when launch records cannot be read", async () => {
    seedStore(origin.machine, "{ not launch records");
    server.claudeScenario("launched");
    expect(await answerOf(accept(server, request))).toEqual(
      unreadableLaunchRecords,
    );
    await noneStarted();
    expect(
      await answerOf(
        accept(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
        }),
      ),
    ).toMatchObject({ kind: "accepted" });
  });
});
