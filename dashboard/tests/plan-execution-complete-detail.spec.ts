// The detail of a story whose plan records its execution as complete shows
// "Execution complete" and the recorded product advice as plain text, or the
// record's gap when it has no readable advice; a plan without the record shows
// no completion. The fake GitHub only publishes the backlog, seed, and plan
// texts; the local read boundary, the shared story-state and plan readers, and
// the page decide everything shown.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";

const repository = "terryyin/open-dough";
const revision = "c3".repeat(20);

const completed = "Execution recorded complete";
const unfinished = "Execution without a completion record";
const adviceless = "Completion record without advice";

const stories = [
  { title: completed, anchor: "completed" },
  { title: unfinished, anchor: "unfinished" },
  { title: adviceless, anchor: "adviceless" },
];

const planPath = (anchor: string) =>
  `.planning/slice-plans/094-${anchor}/PLAN.md`;

const advice = `Queue a story to show <b>advice</b> on the card.
- Keep the detail wording as it is.`;

const slices = `# Plan

## Ordered slices

### 1. Only slice
Type: Behavior
Status: done
Accepted: The journey passed.
`;

const plans: Record<string, string> = {
  completed: `${slices}
## Execution complete

Product advice: ${advice}
`,
  unfinished: slices,
  adviceless: `${slices}
## Execution complete

The retrospective found nothing to record.
`,
};

const backlog = `# Product backlog

## Taken

${stories
  .map(
    ({ title, anchor }) =>
      `- [${title}](seeds/SEED-094-complete.md#${anchor}) — SEED-094#${anchor}`,
  )
  .join("\n")}

## Backlog list
`;

const seed = `---
id: SEED-094
---

# Execution complete fixture
${stories
  .map(
    ({ title, anchor }) => `
<a id="${anchor}"></a>

### ${title}

**Identity:** SEED-094#${anchor}
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/094-${anchor}/PLAN.md"}
\`\`\``,
  )
  .join("\n")}
`;

test("the story detail shows a plan's recorded execution completion and product advice, its gap, or no completion", async ({
  page,
}) => {
  await publishFiles(page, {
    repository,
    revision,
    files: {
      ".planning/PRODUCT-BACKLOG.md": backlog,
      ".planning/seeds/SEED-094-complete.md": seed,
      ...Object.fromEntries(
        stories.map(({ anchor }) => [planPath(anchor), plans[anchor]]),
      ),
    },
  });
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  const { taken } = parts(page);
  const detailOf = async (title: string) => {
    const card = taken.getByRole("article", { name: title });
    await card.getByRole("button", { name: "Inspect story" }).click();
    const detail = card.getByRole("region", { name: `Detail for ${title}` });
    await expect(detail).toContainText("1 of 1 slices recorded complete");
    return detail;
  };

  await test.step("a completed plan's detail shows Execution complete and the advice exactly as recorded, as plain text", async () => {
    const detail = await detailOf(completed);
    await expect(
      detail.getByRole("heading", { name: "Execution complete" }),
    ).toBeVisible();
    await expect(detail.locator(".product-advice")).toHaveText(advice, {
      useInnerText: true,
    });
    await expect(detail.locator("b")).toHaveCount(0);
  });

  await test.step("a record without product advice shows that gap", async () => {
    const detail = await detailOf(adviceless);
    await expect(
      detail.getByRole("heading", { name: "Execution complete" }),
    ).toBeVisible();
    await expect(detail).toContainText(
      "This plan’s “## Execution complete” record has no readable “Product advice:” entry.",
    );
    await expect(detail.locator(".product-advice")).toHaveCount(0);
  });

  await test.step("a plan without the record shows no completion", async () => {
    const detail = await detailOf(unfinished);
    await expect(detail).not.toContainText("Execution complete");
    await expect(detail).not.toContainText("Product advice");
  });
});
