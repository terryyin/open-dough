// Start releases the dashboard while protecting its story, in Codex
// (./responsive-session-start.spec.ts tells the shared promise): the real
// installed starts against a real bare origin (./support/startOrigin.ts)
// whose `pre-receive` hook holds the Take, with the Codex protocol fixture
// holding the native conversation. A story's start and the continuation of
// its kept start close at acceptance and protect only that story's card; a
// refused conversation after a published Take reconciles with that Take,
// keeping its answer and continuation on the Taken card; an unattached
// session's progress stays beside its own action.

import { attempts, keptStarts } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expectStartNote } from "./cardControls.ts";
import {
  expectOthersWork,
  expectProtected,
  expectSubmitted,
  holdAcceptanceAnswers,
  instruction,
  openStories,
} from "./responsiveStart.ts";
import { expect, test } from "./support/codexStart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

test("Start execution closes at acceptance while its Take is held, and continuing its kept start closes while Codex holds the input", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(150_000);
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const push = origin.holdPushes();
  const { story, takenStory: claimed, other } = await openStories(page, origin);
  const answers = await holdAcceptanceAnswers(page);

  await story.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await expect(dialog).toHaveAccessibleName("Start execution in Codex");
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expectSubmitted(page, dialog);
  await answers.reached;
  answers.release();

  await expect(dialog).toBeHidden();
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  expect(await origin.takenProfiles()).toEqual([]);
  await expect(story).toContainText("Preparing execution…");
  await expectProtected(story);
  await expectOthersWork(page, other, story);
  expect(
    native.calls.filter((call) =>
      ["thread/start", "turn/start"].includes(call.method),
    ),
  ).toEqual([]);

  // Codex refuses the conversation after the Take is published: the read of
  // that Take shows the story Taken, with the answer and the kept start.
  native.refuseCreation = true;
  push.release();
  await expect(claimed.locator(".launch-problem")).toContainText(
    "Codex refused to create a conversation.",
    { timeout: 30_000 },
  );
  await expect(claimed).not.toContainText("Local startup in progress");
  await expectStartNote(
    claimed,
    "Start execution",
    "Started here, no session yet",
  );
  await expect(claimed.getByRole("button", { disabled: true })).toHaveCount(0);
  expect(await keptStarts(dashboard)).toHaveLength(1);

  // Continuing the kept start from its Taken card.
  native.refuseCreation = false;
  native.hold = true;
  await claimed.getByRole("button", { name: "Start execution" }).click();
  const continuing = page.getByRole("dialog", {
    name: "Start execution in Codex",
  });
  await continuing.getByRole("button", { name: "Start", exact: true }).click();
  await expect(continuing).toBeHidden();
  await expect
    .poll(() => native.calls.filter((call) => call.method === "turn/start"), {
      timeout: 30_000,
    })
    .toHaveLength(1);
  await expect(claimed).toContainText("Local startup in progress");
  await expect(claimed).toContainText("Starting execution in Codex…");
  await expect(claimed).not.toContainText("Preparing execution…");
  await expectProtected(claimed);
  await expect(
    parts(page)
      .backlog.getByRole("article", { name: "Story B" })
      .getByRole("button", { disabled: true }),
  ).toHaveCount(0);

  native.hold = false;
  native.release();
  await expect(cardSessions(claimed)).toHaveCount(1, { timeout: 30_000 });
  await expect(claimed).not.toContainText("Local startup in progress");
});

test("Start session closes at acceptance while Codex holds its input", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(120_000);
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.hold = true;
  const { story } = await openStories(page, origin);
  const button = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await button.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await dialog.getByRole("textbox").fill("why is CI slow?");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect
    .poll(() => native.calls.filter((call) => call.method === "turn/start"), {
      timeout: 30_000,
    })
    .toHaveLength(1);
  await expect(button).toBeDisabled();
  await expect(page.locator(".start-session-answer")).toContainText(
    "Local startup in progress",
  );
  await expect(story.getByRole("button", { disabled: true })).toHaveCount(0);
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ owned: true }),
  ]);

  native.hold = false;
  native.release();
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(button).toBeEnabled();
});
