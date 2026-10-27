// Protocol evidence decides whether Start may reuse the saved first input.
// Accepted input and lost observation are separate durable facts, including
// confirmed records saved by the previous dashboard's pending-text bug.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  startDashboardServer,
  builtDashboardDir,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { FakeCodex } from "./support/fakeCodex.ts";
import { storeFile } from "./support/retainedReport.ts";
import { notRefinedIdentity, notRefinedStory } from "./launchJourney.ts";
import { openTakenBacklog } from "./launchStoryCardPage.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
const request = {
  ...refinementRequest,
  host: "codex",
  identity: notRefinedIdentity,
  title: notRefinedStory,
  instruction: "Preserve this exact intent.",
};
test.use({ projectFolders: ["open-dough"] });

// The launch's answer to the request above, and the saved launch records of
// a server's home.
type Answer = { kind: string; explanation: string };
const answerOf = async (server: DashboardServer) =>
  JSON.parse((await launch(server, request)).body) as Answer;
const savedRecords = <T = unknown>(home: string) =>
  JSON.parse(readFileSync(storeFile(home), "utf8")) as Record<string, T[]>;
const callsTo = (native: FakeCodex, method: string) =>
  native.calls.filter((call) => call.method === method);

test("lost creation identity persists reconciliation requirement across server restart", async ({
  page,
  dashboard,
  codexProtocol: protocol,
  machine,
  launchJourney,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const { card } = await openTakenBacklog(page, launchJourney);
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
        workspace: path.join(dashboard.home, "git/open-dough"),
        endpoint: `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
      },
    }),
  ]);
  await dashboard.close();
  native.loseCreation = false;
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
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
      path.join(restarted.home, "git/open-dough"),
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
      path.join(restarted.home, "git/open-dough"),
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
      path.join(restarted.home, "git/open-dough"),
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

test("failed identity recording prevents first input and explains the exact known continuation", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const directory = path.join(dashboard.home, ".open-dough/dashboard");
  native.threadId = "known id's identity";
  native.afterCreation = () => {
    chmodSync(directory, 0o555);
  };
  try {
    const result = await answerOf(dashboard);
    expect(result.kind).toBe("uncertain");
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("could not be saved");
    expect(result.explanation).toContain("'codex' 'resume' '--remote'");
    const command = result.explanation.split("`")[1];
    expect(command).toBeDefined();
    execFileSync("/bin/sh", ["-c", command ?? ""], {
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
      path.join(dashboard.home, "git/open-dough"),
      native.threadId,
    ]);
    expect(callsTo(native, "turn/start")).toHaveLength(0);
    expect(await machineSessions(dashboard)).toEqual([]);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    chmodSync(directory, 0o755);
  }
  expect(await answerOf(dashboard)).toMatchObject({ kind: "uncertain" });
  expect(callsTo(native, "thread/start")).toHaveLength(1);
});

test("confirmation clears pending evidence; legacy reload is truthful and connection loss retains continuation context", async ({
  page,
  dashboard,
  codexProtocol: native,
  launchJourney,
}) => {
  if (native === undefined) throw new Error("Missing native fixture.");
  const { card } = await openTakenBacklog(page, launchJourney);
  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          ...refinementRequest,
          identity: notRefinedIdentity,
          title: notRefinedStory,
          host: "codex",
        })
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
  const document = savedRecords<{ firstInput: { explanation?: string } }>(
    dashboard.home,
  );
  const legacy = document["open-dough"]?.[0];
  if (legacy === undefined) throw new Error("Missing saved legacy record.");
  legacy.firstInput.explanation =
    "First-input acceptance has not been acknowledged. Continue this conversation before starting again.";
  writeFileSync(storeFile(dashboard.home), JSON.stringify(document));
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
