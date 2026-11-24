// On a touch screen a Recently done row's Session details disclosure opens
// with a tap and identifies the completion, not the launch.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import {
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { ageShown, mountSessions } from "./recently-done-sidebar-mount-page.ts";

test("a tap on a Done row's Session details shows its completion and identity, not its launch", async () => {
  await useTouchScreen();
  const title = "Touch done completion age";
  const done = makeMe.aLaunchRecord
    .executing({ identity: "SEED-902#touch-done", title })
    .inClaudeSession({ sessionId: "touch-done-completion" })
    .launchedAt(minutesAgo(24 * 60))
    .markedDoneAt(minutesAgo(2))
    .please();
  const shown = await mountSessions(
    makeMe.aMachineAnswer.observingUnavailable(done).please(),
  );
  await shown.header.click();
  await expect.poll(shown.titles).toEqual([title]);
  const row = shown.row(title);
  const disclosure = row?.querySelector<HTMLElement>(
    ".sessions-sidebar-session-entry-details summary",
  );
  if (row === undefined || disclosure === null || disclosure === undefined)
    throw new Error("No Session details disclosure.");
  expect(disclosure.textContent).toContain("Session details");
  expect(ageShown(row)?.getAttribute("aria-label")).toBe("Completed 2m ago");

  await tapWhereShown(disclosure);

  const facts = page.elementLocator(
    row.querySelector(".sessions-sidebar-session-entry-facts") ?? row,
  );
  await expect
    .element(
      facts.getByText(
        `Completed ${new Date(done.doneAt ?? "").toLocaleString()}`,
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(facts.getByText("SEED-902#touch-done", { exact: true }))
    .toBeVisible();
  expect(
    facts
      .getByText(`Launched ${new Date(done.launchedAt).toLocaleString()}`, {
        exact: true,
      })
      .query(),
  ).toBeNull();
});
