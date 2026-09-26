// An admitted investigation that was never queued is shown in Taken from the
// admission commit the production startup CLI accepted (admittedWork.ts); the
// fake GitHub serves that commit's Git bytes, and the local read boundary, the
// shared readers, and the page decide everything shown.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  admitInvestigation,
  admitted,
  publishAdmission,
  stillQueued,
  type Admission,
} from "./admittedWork.ts";

let admission: Admission;
const cleanups: Array<() => void> = [];
// Admitting runs the production commands against Git (about 2s idle, over 15s
// on a busy machine); give it its own budget so it cannot spend the page's
// time inside the default per-test timeout.
test.beforeAll(() => {
  test.setTimeout(60_000);
  admission = admitInvestigation((cleanup) => cleanups.push(cleanup));
});
test.afterAll(() => {
  for (const cleanup of cleanups) cleanup();
});

test("an admitted investigation that was never queued shows its purpose, owner, and unselected preparation in Taken", async ({
  page,
}) => {
  await publishAdmission(page, admission);
  await page.goto("/");
  await expectMembership(page, {
    taken: [admitted.title],
    backlog: [stillQueued.title],
  });
  const card = parts(page).taken.getByRole("article", {
    name: admitted.title,
  });
  await expect(card).toContainText(
    "Yui-chan · Story Branch Mode · Claude Code · claude-opus-5-5",
  );
  await expect(card).toContainText(
    `Branch context: ${admitted.branch} (story branch work; not on trunk)`,
  );
  await expect(card.getByText("Refined", { exact: true })).toBeVisible();
  await expect(
    card.getByText("Ready for execution", { exact: true }),
  ).toHaveCount(0);
  await card.getByText("Preparation facts").click();
  await expect(card).toContainText("Approach: Unselected");
  await expect(card).toContainText("Assessment: Absent");
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    card.getByRole("region", { name: `Detail for ${admitted.title}` }),
  ).toContainText(admitted.purpose);
});
