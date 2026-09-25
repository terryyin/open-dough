import { expect, test } from "./dashboardTest.ts";
import { openDirection, parts } from "./dashboardPage.ts";
import {
  emptyBacklog,
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
} from "./publishedOrigin.ts";
import { expectFocusedAndIndicated } from "./accessibleReading.ts";

const revisionA = "a".repeat(40);
const revisionB = "b".repeat(40);
const fullDirection = `Keep published work visible.

Read <img src=x onerror="document.title='direction ran'"> as text.
Finish with the complete final line.`;
const withDirection = (direction: string) => `# Product backlog

## Near-future direction

${direction}

## Taken

## Backlog list
`;

test("direction starts collapsed and opens by pointer and keyboard without reading again", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, withDirection(fullDirection));
  await page.goto("/");
  const { direction, directionToggle, source } = parts(page);
  const body = direction.locator("p");
  await expect(source).toContainText(revisionA);
  await expect(directionToggle).toBeVisible();
  await expect(body).toBeHidden();
  await expect(direction.locator("details")).not.toHaveAttribute("open");

  await openDirection(page);
  await expect(body).toHaveText(fullDirection);
  await expect(body).toHaveCSS("white-space", "pre-line");
  await expect(direction.locator("img, script")).toHaveCount(0);
  await expect(direction.locator("details")).toHaveAttribute("open", "");
  await directionToggle.click();
  await expect(body).toBeHidden();

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expectFocusedAndIndicated(page, directionToggle);
  await page.keyboard.press("Enter");
  await expect(body).toBeVisible();
  await page.keyboard.press("Space");
  await expect(body).toBeHidden();
  await expect(directionToggle).toBeFocused();
  expect(pathsRead(origin)).toEqual([
    "main",
    `PRODUCT-BACKLOG.md?ref=${revisionA}`,
  ]);
});

test("same-project refresh retains expanded and collapsed choices through loading, replacement, and failure", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, withDirection(fullDirection));
  await page.goto("/");
  const {
    direction,
    directionToggle,
    refresh,
    retry,
    source,
    reading,
    problem,
  } = parts(page);
  const body = direction.locator("p");
  await openDirection(page);

  origin.push(revisionB, withDirection("The next published direction."));
  const release = origin.hold("main");
  await refresh.click();
  await expect(reading).toBeVisible();
  await expect(body).toBeVisible();
  await expect(body).toHaveText(fullDirection);
  release();
  await expect(source).toContainText(revisionB);
  await expect(body).toBeVisible();
  await expect(body).toHaveText("The next published direction.");

  const restore = origin.answerWith("main", rateLimitedAnswer());
  await refresh.click();
  await expect(problem).toBeVisible();
  await expect(body).toBeVisible();
  await expect(body).toHaveText("The next published direction.");
  await directionToggle.click();
  await retry.click();
  await expect(problem).toBeVisible();
  await expect(body).toBeHidden();
  restore();
  origin.push(revisionA, withDirection(fullDirection));
  await retry.click();
  await expect(source).toContainText(revisionA);
  await expect(body).toBeHidden();
  await expect(problem).toHaveCount(0);
});

test("changing projects removes previous direction while reading and starts each observation collapsed", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, withDirection(fullDirection));
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  doughnut.push(revisionB, emptyBacklog);
  await page.goto("/");
  const { direction, project, source, reading } = parts(page);
  await openDirection(page);

  const release = doughnut.hold("main");
  await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
  await expect(reading).toBeVisible();
  await expect(direction).toHaveCount(0);
  await expect(page.getByText(fullDirection)).toHaveCount(0);
  release();
  await expect(source).toContainText(revisionB);
  const body = direction.locator("p");
  await expect(body).toBeHidden();
  await openDirection(page);
  await expect(body).toHaveText("No near-future direction is recorded.");
  expect(pathsRead(doughnut)).toHaveLength(2);

  await project.getByRole("radio", { name: "Open Dough", exact: true }).check();
  await expect(source).toContainText(revisionA);
  await expect(body).toBeHidden();
  await openDirection(page);
  await expect(body).toHaveText(fullDirection);
  expect(pathsRead(origin)).toHaveLength(4);
});
