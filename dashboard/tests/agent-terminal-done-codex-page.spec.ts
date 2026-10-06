// Rendered controls, reload, native failure and readiness exercise the same stored record.
// Mark as done in the panel on a Codex session waiting for input asks first.
import { test, expect, stored } from "./support/codexLaunch.ts";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedIdentity,
  notRefinedStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
  codexTerminalMode,
} from "./support/codexTerminal.ts";
import {
  expectAsked,
  markAsDone,
  markDoneAnyway,
  waitingForInput,
} from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());
for (const attached of [false, true]) {
  test(`mark ${attached ? "waiting attached" : "completed unattached"} Codex done, reload, fail reopening then reopen original identity`, async ({
    page,
    dashboard,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture");
    await launch(dashboard, {
      ...refinementRequest,
      identity: notRefinedIdentity,
      title: notRefinedStory,
      host: "codex",
    });
    native.observations.set(native.threadId, {
      status: {
        type: attached ? "active" : "notLoaded",
        ...(attached ? { activeFlags: ["waitingOnUserInput"] } : {}),
      },
      turns: [
        { id: "original-turn", status: attached ? "inProgress" : "completed" },
      ],
    });
    const { card, settled } = await openStoryStagesJourney(page, journey);
    const listed = cardSessions(card(notRefinedStory));
    const recent = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: native.threadId });
    const panel = page.getByRole("region", { name: "Terminal" });
    await expect(listed.locator(".session-state")).toHaveText(
      attached
        ? "Needs input: Codex is waiting for your input"
        : "Ready for review",
    );
    if (attached) {
      await listed.getByRole("button", { name: "Open terminal" }).click();
      await expect(panel.locator(".xterm-rows")).toContainText(
        "original retained history",
      );
      const question = await expectAsked(panel, waitingForInput);
      await markAsDone(question).click();
      await expect(panel).toHaveCount(0);
      const pid = codexAttaches(native)[0]?.pid ?? 0;
      await expect.poll(() => codexEnded(native, pid)).toBe("SIGHUP");
      expect(codexLines(native, pid)).toEqual([]);
    } else await markDoneAnyway(listed);
    await expect(listed).toHaveCount(0);
    await expect(recent.locator(".session-state")).toHaveText("Done");
    await expect(recent).toContainText(
      `Named done-${stored(dashboard.home)[0]?.session.name ?? ""}`,
    );
    const doneAt = stored(dashboard.home)[0]?.doneAt;
    expect(doneAt).toBeDefined();
    await page.reload();
    await settled();
    await expect(recent.locator(".session-state")).toHaveText("Done");
    expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
    codexTerminalMode(native, "fail");
    await recent.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.getByRole("status")).toContainText(
      "The session could not be attached",
    );
    expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
    codexTerminalMode(native, "ready");
    await panel.getByRole("button", { name: "Reconnect" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText(
      "original retained history",
    );
    await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
    await expect(listed).toHaveCount(1);
    await expect(recent).toHaveCount(0);
    expect(
      codexAttaches(native).every(
        (attachment) => attachment.args.at(-1) === native.threadId,
      ),
    ).toBe(true);
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/interrupt"),
    ).toEqual(
      attached
        ? [
            {
              method: "turn/interrupt",
              params: { threadId: native.threadId, turnId: "original-turn" },
            },
          ]
        : [],
    );
    await page.reload();
    await expect(listed).toHaveCount(1);
    expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  });
}

test("native interrupt refusal remains Working with retained local intent and diagnostic through reload, cleared only by successful native ready", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  });
  native.observations.set(native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "refused-turn", status: "inProgress" }],
  });
  native.interruptError = {
    code: -32000,
    message: "Owner denied native interruption.",
  };
  const { card } = await openStoryStagesJourney(page, journey);
  const listed = cardSessions(card(notRefinedStory));
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: native.threadId });
  const panel = page.getByRole("region", { name: "Terminal" });
  await listed.getByRole("button", { name: "Open terminal" }).click();
  await expect(panel.locator(".xterm-rows")).toContainText(
    "original retained history",
  );
  await markDoneAnyway(panel);
  await expect(panel).toHaveCount(0);
  await expect(listed).toHaveCount(0);
  await expect(recent.locator(".session-state")).toHaveText("Working");
  await expect(recent).not.toContainText("Named done-");
  await expect(recent).toContainText("Intended name done-");
  await expect(recent.getByRole("status").first()).toContainText(
    "Local done mark retained. Codex stop failed: Owner denied native interruption.",
  );
  const problem = stored(dashboard.home)[0]?.doneProblem;
  expect(problem).toContain("Owner denied native interruption");
  await page.reload();
  await expect(recent.locator(".session-state")).toHaveText("Working");
  await expect(recent).toContainText(problem ?? "missing diagnostic");
  codexTerminalMode(native, "review");
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(panel.locator(".xterm-rows")).toContainText("Hooks need review");
  expect(stored(dashboard.home)[0]?.doneProblem).toBe(problem);
  expect(stored(dashboard.home)[0]?.doneAt).toBeDefined();
  await panel.locator(".xterm-screen").click();
  await page.keyboard.press("Escape");
  await expect.poll(() => stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  expect(stored(dashboard.home)[0]?.doneProblem).toBeUndefined();
  await expect(listed).toHaveCount(1);
  await expect(recent).toHaveCount(0);
  await expect(listed).not.toContainText("Owner denied native interruption");
  expect(native.observations.get(native.threadId)?.turns).toEqual([
    { id: "refused-turn", status: "inProgress" },
  ]);
});
