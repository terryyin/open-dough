// Protocol evidence decides whether Start may reuse the saved first input.
// Accepted input and lost observation are separate durable facts, including
// confirmed records saved by the previous dashboard's pending-text bug. An
// identity that cannot be recorded:
// ../../dashboard/backend-tests/launches/agent-launch-codex-creation-boundary.spec.ts.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  startDashboardServer,
  sharedDashboardBuild,
  type DashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import type { FakeCodex } from "../../dashboard/test-support/support/fakeCodex.ts";
import {
  keepLaunchStoreText,
  launchStoreFile,
} from "../../dashboard/test-support/support/launchStore.ts";
import {
  notRefinedIdentity,
  queuedDashboardRepository,
  notRefinedStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  launch,
  machineSessions,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectInstalledCodexStoryInput } from "./codexLaunchObservation.ts";

const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .withInstruction("Preserve this exact intent.")
  .please();

test.use({ originRepository: queuedDashboardRepository().please() });

// The launch's answer to the request above, and the saved launch records of
// a server's home.
type Answer = { kind: string; explanation: string };
const answerOf = async (server: DashboardServer) =>
  JSON.parse((await launch(server, request)).body) as Answer;
const savedRecords = <T = unknown>(home: string) =>
  JSON.parse(readFileSync(launchStoreFile(home), "utf8")) as Record<
    string,
    T[]
  >;
const callsTo = (native: FakeCodex, method: string) =>
  native.calls.filter((call) => call.method === method);

test("lost creation identity persists reconciliation requirement across server restart", async ({
  page,
  dashboard,
  codexProtocol: protocol,
  machine,
  origin,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const { card } = await openInstalledStoryBoard(page, origin);
  native.loseCreation = true;
  const answer = await answerOf(dashboard);
  expect(answer.kind).toBe("uncertain");
  expect(answer.explanation).toContain("trustworthy conversation identity");
  expect(await machineSessions(dashboard)).toEqual([]);
  const disk = savedRecords(dashboard.home);
  expect(disk["open-dough"]).toEqual([
    expect.objectContaining({
      request: expect.objectContaining({ host: "codex" }),
      creation: {
        workspace: path.join(origin.project, ".worktrees", "story-c"),
        endpoint: `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      },
    }),
  ]);
  await dashboard.close();
  native.loseCreation = false;
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine,
    github: dashboard.github,
    codexProtocol: protocol,
  });
  try {
    const retry = await answerOf(restarted);
    expect(retry.kind).toBe("uncertain");
    expect(retry.explanation).toContain(
      "reconcile this machine's launch evidence with it",
    );
    expect(retry.explanation).toContain(
      path.join(origin.project, ".worktrees", "story-c"),
    );
    const port = Number(new URL(restarted.baseURL).port);
    await openUntilRead(page, `http://localhost:${port}/`);
    const pending = page.getByRole("article", {
      name: `${notRefinedStory} unresolved creation`,
    });
    await expect(pending).toHaveCount(2);
    await expect(pending.first()).toContainText(
      "No trustworthy conversation ID was returned",
    );
    await expect(pending.first()).toContainText(
      path.join(origin.project, ".worktrees", "story-c"),
    );
    await expect(pending.first()).toContainText(
      "Conversation creation in Codex unresolved",
    );
    expect(
      await card(notRefinedStory)
        .getByRole("article", {
          name: `${notRefinedStory} unresolved creation`,
        })
        .count(),
    ).toBe(1);
    const picker =
      (await pending.first().locator("code").allTextContents())[1] ?? "";
    execFileSync("/bin/sh", ["-c", picker], {
      env: { ...process.env, ...native.env },
      stdio: "pipe",
    });
    expect(
      JSON.parse(readFileSync(native.env["FAKE_CODEX_CLI_LOG"] ?? "", "utf8")),
    ).toEqual([
      "resume",
      "--remote",
      `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      "--cd",
      path.join(origin.project, ".worktrees", "story-c"),
      "--include-non-interactive",
    ]);
    expect(await machineSessions(restarted)).toEqual([]);
    expect(callsTo(native, "thread/start")).toHaveLength(1);
    expect(callsTo(native, "turn/start")).toHaveLength(0);
    expect(savedRecords(restarted.home)).toEqual(disk);
  } finally {
    await restarted.close();
  }
});

test("confirmation clears pending evidence; legacy reload is truthful and connection loss retains continuation context", async ({
  page,
  dashboard,
  codexProtocol: native,
  origin,
}) => {
  if (native === undefined) throw new Error("Missing native fixture.");
  const { card } = await openInstalledStoryBoard(page, origin);
  expect(
    JSON.parse(
      (
        await launch(
          dashboard,
          makeMe.aLaunchRequest
            .refining({
              identity: notRefinedIdentity,
              title: notRefinedStory,
              host: "codex",
            })
            .please(),
        )
      ).body,
    ),
  ).toMatchObject({ kind: "launched" });
  const session = storyCardSessions(card(notRefinedStory));
  await reloadUntilRead(page);
  await expect(session).toContainText("First input accepted");
  expect(stored(dashboard.home)[0]?.firstInput).not.toHaveProperty(
    "explanation",
  );
  await expect(session).not.toContainText("has not been acknowledged");
  const saved = stored(dashboard.home)[0];
  if (saved?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  expectInstalledCodexStoryInput(
    dashboard,
    native,
    saved,
    `$dough-story-refinement ${notRefinedIdentity}`,
  );
  const document = savedRecords<{ firstInput: { explanation?: string } }>(
    dashboard.home,
  );
  const legacy = document["open-dough"]?.[0];
  if (legacy === undefined) throw new Error("Missing saved legacy record.");
  legacy.firstInput.explanation =
    "First-input acceptance has not been acknowledged. Continue this conversation before starting again.";
  keepLaunchStoreText(dashboard.home, JSON.stringify(document));
  await reloadUntilRead(page);
  await expect(session).toContainText("First input accepted");
  await expect(session).not.toContainText("has not been acknowledged");
  await expect(session).toContainText(saved.session.sessionId);
  native.failConnection();
  await expect
    .poll(() => {
      const session = stored(dashboard.home)[0]?.session;
      return session?.host === "codex"
        ? session.continuation?.notice
        : undefined;
    })
    .toContain("native connection ended");
  await reloadUntilRead(page);
  await expect(session).toContainText("First input accepted");
  await expect(session).toContainText("native connection ended");
  await expect(session).not.toContainText("has not been acknowledged");
  const current = stored(dashboard.home)[0];
  if (current?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  expect(current.session.continuation?.args).toEqual(
    saved.session.continuation?.args,
  );
  expect(callsTo(native, "turn/start")).toHaveLength(1);
});
