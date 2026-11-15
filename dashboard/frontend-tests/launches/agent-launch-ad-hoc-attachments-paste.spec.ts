// Pasting text into Start session's instruction field still inserts the text
// and attaches nothing (SEED-204 E1 / commitment 5c). Built frontend against
// the default service substitutes; a pasted image reaching the session is
// ../../../e2e/launches/agent-launch-ad-hoc-attachments.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../tests/launchStoryCardPage.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("pasting text into the instruction field still inserts the text", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  const field = startSessionField(dialog);
  await field.fill("Why is this card clipped?");
  await field.focus();
  await field.evaluate((el: HTMLTextAreaElement) => {
    el.setSelectionRange(el.value.length, el.value.length);
  });

  await page.evaluate(() => navigator.clipboard.writeText(" Look closer."));
  await field.press("ControlOrMeta+v");

  await expect(field).toHaveValue("Why is this card clipped? Look closer.");
  await expect(
    dialog.getByRole("list", { name: "Attached images" }),
  ).toHaveCount(0);
});
