import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  test,
  twoDependencies,
  recordDependency,
  publishDependencies,
  takeSupplier,
} from "./storyDependencyFixture.ts";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { startOrigin } from "./support/startOrigin.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

const pygardonHome =
  "seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility";

async function recordReveals(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    // The captured native method is called with the actual element below.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const original = Element.prototype.scrollIntoView;
    const reveals: { name: string | null; behavior: string | undefined }[] = [];
    Object.assign(window, { storyReveals: reveals });
    Element.prototype.scrollIntoView = function (options) {
      reveals.push({
        name: this.getAttribute("aria-label"),
        behavior: typeof options === "object" ? options.behavior : undefined,
      });
      original.call(this, options);
    };
  });
}

test("distinct stories in one seed follow their recorded identities by keyboard and touch at a narrow reduced-motion viewport", async ({
  page,
  origin,
  dashboard,
}) => {
  await twoDependencies(origin);
  const seedPath = path.join(origin.project, ".planning/seeds/B.md");
  writeFileSync(
    seedPath,
    `${readFileSync(seedPath, "utf8")}\n<a id="second"></a>\n\n### Second story in seed B\n\n**Identity:** SEED-B#second\n\nAnother outcome.\n`,
  );
  const backlogPath = path.join(origin.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlogPath,
    `${readFileSync(backlogPath, "utf8")}\n- [Second story in seed B](seeds/B.md#second) — SEED-B#second\n`,
  );
  recordDependency(origin, 1, "waiting", undefined, {
    identity: "SEED-B#second",
    href: "seeds/B.md#second",
  });
  takeSupplier(origin);
  const revision = await publishDependencies(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordReveals(page);
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const first = parts(page).taken.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  const second = parts(page).backlog.getByRole("article", {
    name: "Second story in seed B",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").tap();
  const reference = consumer.getByRole("link", {
    name: "SEED-B#second",
    exact: true,
  });
  await reference.focus();
  await page.keyboard.press("Enter");
  await expect(
    second.getByRole("region", { name: "Detail for Second story in seed B" }),
  ).toBeVisible();
  await expect(second).toBeFocused();
  await expect(second).toBeInViewport({ ratio: 0.5 });
  await expect(first.getByRole("region")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (
          window as unknown as { storyReveals: { behavior: string }[] }
        ).storyReveals.at(-1)?.behavior,
    ),
  ).toBe("auto");
  await consumer.getByRole("link", { name: "SEED-B#b", exact: true }).tap();
  await expect(
    first.getByRole("region", { name: "Detail for Story B" }),
  ).toBeVisible();
  await expect(first).toBeFocused();
  await expect(first).toBeInViewport({ ratio: 0.5 });
  await expect(second.getByRole("region")).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("each project's rendered pinned reference opens its own telling of the same identity, including Pygardon's seed URL shape", async ({
  page,
  origin,
  dashboard,
  afterGitHubStops,
}) => {
  const revision = await twoDependencies(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  const pygardon = await startOrigin("terryyin/pygardon", "pygardon");
  afterGitHubStops(() => {
    pygardon.cleanup();
  });
  await twoDependencies(pygardon);
  writeFileSync(
    path.join(
      pygardon.project,
      ".planning/seeds/SEED-120-release-readiness.md",
    ),
    '---\nid: SEED-B\n---\n\n# Seed B\n\n<a id="story-checked-artifact-eligibility"></a>\n\n### Pygardon selected story\n\n**Identity:** SEED-B#b\n\nDeliver Pygardon outcome.\n',
  );
  const backlog = path.join(pygardon.project, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8").replace(
      "[Story B](seeds/B.md#b)",
      `[Pygardon selected story](${pygardonHome})`,
    ),
  );
  recordDependency(pygardon, 0, "waiting", undefined, {
    identity: "SEED-B#b",
    href: pygardonHome,
  });
  const targetRevision = await publishDependencies(pygardon);
  await publishCommittedOrigin(page, {
    repoDir: pygardon.project,
    revision: targetRevision,
    repository: "terryyin/pygardon",
  });
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-B#b", exact: true }).click();
  await expect(
    parts(page).backlog.getByRole("article", { name: "Story B", exact: true }),
  ).toBeFocused();
  await parts(page)
    .project.getByRole("radio", { name: "Pygardon", exact: true })
    .click();
  await expect(consumer.locator(".story-dependencies summary")).toBeVisible();
  await consumer.locator(".story-dependencies summary").click();
  const reference = consumer.getByRole("link", {
    name: "SEED-B#b",
    exact: true,
  });
  await expect(reference).toHaveAttribute(
    "href",
    `https://github.com/terryyin/pygardon/blob/${targetRevision}/.planning/${pygardonHome}`,
  );
  await reference.click();
  const destination = parts(page).backlog.getByRole("article", {
    name: "Pygardon selected story",
    exact: true,
  });
  await expect(
    destination.getByRole("region", {
      name: "Detail for Pygardon selected story",
    }),
  ).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(
    parts(page).backlog.getByRole("article", { name: "Story B", exact: true }),
  ).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("project")).toBe("pygardon");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});
