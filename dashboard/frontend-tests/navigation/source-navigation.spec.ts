import { expectSettledPage } from "../../tests/dashboardPage.ts";
import {
  canonicalRecord,
  slicePlanLink,
} from "../../tests/storyCardControls.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  card,
  destination,
  followLeavingDashboard,
  forEachStoryCardsSources,
  inspectedSources,
  openDashboard,
  revision,
  snapshotRoot,
} from "../../tests/support/frontendSourceNavigation.ts";

test("source navigation opens canonical and plan records at the inspected revision", async ({
  page,
  frontendServices,
}) => {
  const { board, requestedPaths, outsideDashboard } = await openDashboard(
    page,
    frontendServices,
  );
  const story = card(
    board,
    "See the project's published work in a story dashboard",
  );

  await test.step("a story's seed link and its plan link", async () => {
    const sources = await inspectedSources(story);
    const storyRecord = canonicalRecord(sources);
    await expect(storyRecord).toContainText(
      "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
    );
    const canonical = await destination(storyRecord);
    expect(canonical.origin).toBe("https://github.com");
    expect(canonical.pathname).toBe(
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md`,
    );
    expect(canonical.hash).toBe("#see-published-work");

    const planRecord = slicePlanLink(sources);
    await expect(planRecord).toContainText(
      "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
    );
    const plan = await destination(planRecord);
    expect(plan.origin).toBe("https://github.com");
    expect(plan.pathname).toBe(
      `${snapshotRoot}/.planning/slice-plans/061-published-story-dashboard/PLAN.md`,
    );
    expect(plan.hash).toBe("#ordered-slices");
    await expect(sources.getByRole("link")).toHaveCount(2);
    await expect(sources).toContainText(
      `File in this snapshot, at revision ${revision.slice(0, 7)}.`,
    );
  });

  await test.step("a bounded correction's bare plan link, by the same rule", async () => {
    const correction = card(board, "Repair the installer's update report");
    const links = (await inspectedSources(correction)).getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAccessibleName(
      "Canonical record slice-plans/059-installer-update-report/PLAN.md",
    );
    const canonical = await destination(links);
    expect(canonical.pathname).toBe(
      `${snapshotRoot}/.planning/slice-plans/059-installer-update-report/PLAN.md`,
    );
    expect(canonical.hash).toBe("");
  });

  await test.step("dot segments and a root path resolve inside the repository", async () => {
    const linkOf = async (title: string) =>
      (await inspectedSources(card(board, title))).getByRole("link");
    const outsidePlanning = await destination(
      await linkOf("Follow a record kept outside the planning directory"),
    );
    expect(outsidePlanning.pathname).toBe(
      `${snapshotRoot}/docs/adrs/0001-ubiquitous-language-accepted.md`,
    );
    expect(outsidePlanning.hash).toBe("#decision");
    const fromRoot = await destination(
      await linkOf("Follow a record named from the repository root"),
    );
    expect(fromRoot.pathname).toBe(
      `${snapshotRoot}/docs/release%20notes/2026.md`,
    );
  });

  await test.step("every card's outbound anchors open in a new tab with safe opener policy", async () => {
    let seen = 0;
    await forEachStoryCardsSources(board, async (sources) => {
      for (const anchor of await sources.locator("a[href]").all()) {
        seen += 1;
        await expect(anchor).toHaveAttribute("target", "_blank");
        await expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
    expect(seen).toBeGreaterThan(0);
  });

  await test.step("showing links reads in-repository canonical files and no external or unsafe target", async () => {
    await expectSettledPage(page);
    expect(outsideDashboard()).toEqual([]);
    // Record reads run concurrently, so only their set is fixed.
    expect(requestedPaths().sort()).toEqual([
      ".planning/seeds/SEED-021-observe-published-story-progress.md",
      ".planning/slice-plans/059-installer-update-report/PLAN.md",
      "docs/adrs/0001-ubiquitous-language-accepted.md",
      "docs/release notes/2026.md",
    ]);
  });

  await test.step("following a snapshot link opens that GitHub page in a new tab while dashboard stays in place", async () => {
    await inspectedSources(story);
    const detail = story.getByRole("region", {
      name: "Detail for See the project's published work in a story dashboard",
    });
    const record = canonicalRecord(detail);
    const dest = await followLeavingDashboard(page, record, "Open Dough");
    expect(dest.origin).toBe("https://github.com");
    expect(dest.pathname).toBe(
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md`,
    );
    await expect(detail).toBeVisible();
    await expect(
      story.getByRole("button", { name: "Hide detail" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
