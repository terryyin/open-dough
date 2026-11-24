// The Recently done section and the open list share the Sessions sidebar but
// scroll on their own: reaching the end of the open list reveals no older Done
// rows.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  adHocSessions,
  mountSessions,
} from "./recently-done-sidebar-mount-page.ts";

test("scrolling the open list to its end leaves Recently done's range unchanged", async () => {
  const done = adHocSessions("Done", 45, true);
  const open = adHocSessions("Open", 30, false);
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingUnavailable(...done)
      .observingOpen(...open)
      .please(),
  );
  await shown.header.click();
  await expect.poll(shown.titles).toHaveLength(20);
  const list = document.querySelector<HTMLElement>(
    ".sessions-sidebar-sessions",
  );
  if (list === null) throw new Error("No open list.");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  list.scrollTop = list.scrollHeight;
  list.dispatchEvent(new Event("scroll", { bubbles: true }));
  await expect.poll(() => list.scrollTop).toBeGreaterThan(0);
  expect(shown.titles()).toHaveLength(20);
});

test("the Recently done divider is named and keyed arrows resize the section", async () => {
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingUnavailable(...adHocSessions("Done", 30, true))
      .observingOpen(...adHocSessions("Open", 30, false))
      .please(),
  );
  await shown.header.click();
  const divider = page.getByRole("separator", {
    name: "Recently done sessions divider",
  });
  await expect.element(divider).toBeVisible();
  const before = Number(divider.element().getAttribute("aria-valuenow"));
  expect(before).toBeGreaterThan(0);
  await divider.click();
  await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
  await expect
    .poll(() => Number(divider.element().getAttribute("aria-valuenow")))
    .toBeGreaterThan(before);
});
