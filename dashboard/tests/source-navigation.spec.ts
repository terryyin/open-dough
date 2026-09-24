import { expect, test } from "./dashboardTest";
import { openDirection, parts } from "./dashboardPage";
import {
  card,
  destination,
  openDashboard,
  revision,
  snapshotRoot,
} from "./sourceNavigationJourney";

test("source navigation opens canonical and plan records at the inspected revision", async ({
  page,
}) => {
  const { stages, leftTheServer, askedOfGitHub } = await openDashboard(page);
  const story = card(
    stages,
    "See the project's published work in a story dashboard",
  );
  const storyRecord = story.getByRole("link", { name: /^Canonical record / });

  await test.step("a story's seed link and its plan link", async () => {
    await expect(storyRecord).toContainText(
      "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
    );
    const canonical = await destination(storyRecord);
    expect(canonical.origin).toBe("https://github.com");
    expect(canonical.pathname).toBe(
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md`,
    );
    expect(canonical.hash).toBe("#see-published-work");

    const plan = await destination(
      story.getByRole("link", { name: /^Slice plan / }),
    );
    expect(plan.origin).toBe("https://github.com");
    expect(plan.pathname).toBe(
      `${snapshotRoot}/.planning/quick/061-published-story-dashboard/PLAN.md`,
    );
    expect(plan.hash).toBe("#ordered-slices");
    await expect(story.getByRole("link")).toHaveCount(2);
    await expect(story).toContainText(
      `File in this snapshot, at revision ${revision.slice(0, 7)}.`,
    );
  });

  await test.step("a bounded correction's bare plan link, by the same rule", async () => {
    const correction = card(stages, "Repair the installer's update report");
    const links = correction.getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAccessibleName(
      "Canonical record quick/059-installer-update-report/PLAN.md",
    );
    const canonical = await destination(links);
    expect(canonical.pathname).toBe(
      `${snapshotRoot}/.planning/quick/059-installer-update-report/PLAN.md`,
    );
    expect(canonical.hash).toBe("");
  });

  await test.step("dot segments and a root path resolve inside the repository", async () => {
    const outsidePlanning = await destination(
      card(
        stages,
        "Follow a record kept outside the planning directory",
      ).getByRole("link"),
    );
    expect(outsidePlanning.pathname).toBe(
      `${snapshotRoot}/docs/adrs/0001-ubiquitous-language-accepted.md`,
    );
    expect(outsidePlanning.hash).toBe("#decision");
    const fromRoot = await destination(
      card(stages, "Follow a record named from the repository root").getByRole(
        "link",
      ),
    );
    expect(fromRoot.pathname).toBe(
      `${snapshotRoot}/docs/release%20notes/2026.md`,
    );
  });

  await test.step("showing links reads in-repository canonical files and no external or unsafe target", async () => {
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    expect(leftTheServer()).toEqual([]);
    const [ref, backlog, ...records] = askedOfGitHub();
    expect([ref, backlog]).toEqual([
      "/repos/terryyin/open-dough/commits/main",
      `/repos/terryyin/open-dough/contents/.planning/PRODUCT-BACKLOG.md?ref=${revision}`,
    ]);
    // Record reads run concurrently, so only their set is fixed.
    expect(records.sort()).toEqual(
      [
        // The agent profile directory is listed for Taken owners.
        ".planning/agents",
        ".planning/quick/059-installer-update-report/PLAN.md",
        ".planning/seeds/SEED-021-observe-published-story-progress.md",
        "docs/adrs/0001-ubiquitous-language-accepted.md",
        "docs/release%20notes/2026.md",
      ].map(
        (path) => `/repos/terryyin/open-dough/contents/${path}?ref=${revision}`,
      ),
    );
  });

  await test.step("following the link leaves for that GitHub page", async () => {
    const [leaving] = await Promise.all([
      page.waitForRequest((request) => request.isNavigationRequest()),
      storyRecord.click(),
    ]);
    expect(new URL(leaving.url()).pathname).toBe(
      `${snapshotRoot}/.planning/seeds/SEED-021-observe-published-story-progress.md`,
    );
  });
});

test("source navigation keeps an external reference apart from files in this snapshot", async ({
  page,
}) => {
  const { stages } = await openDashboard(page);
  const note = card(stages, "Read the hosting provider's note");

  const canonical = note.getByRole("link", { name: /^Canonical record / });
  await expect(canonical).toHaveAttribute(
    "href",
    "https://status.example.com/notes/2026-09?view=full#api",
  );
  await expect(canonical).toHaveAttribute("rel", "noopener noreferrer");
  await expect(
    note.getByRole("link", { name: /^Slice plan / }),
  ).toHaveAttribute("href", "http://plans.example.org/note-7");
  await expect(
    note.getByText(
      "External reference. It is not a file in this snapshot and is not tied to the inspected revision.",
    ),
  ).toHaveCount(2);
  await expect(note).not.toContainText("File in this snapshot");
  await expect(note).not.toContainText(revision.slice(0, 7));
});

test("source navigation shows unsafe or invalid targets as text that cannot be followed", async ({
  page,
}) => {
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  const { stages } = await openDashboard(page);
  const opened = { title: await page.title(), url: page.url() };

  await test.step("script and data schemes stay readable and are not links", async () => {
    const hostile = card(stages, /Run a script from a link/);
    await expect(hostile).toContainText(
      "Canonical record javascript:document.title='canonical-ran'",
    );
    await expect(hostile).toContainText(
      "Slice plan data:text/html,<script>document.title='plan-ran'</script>",
    );
    await expect(hostile).toContainText(
      "Not offered as a link. Links that use “javascript:” are not opened from here.",
    );
    await expect(hostile).toContainText(
      "Not offered as a link. Links that use “data:” are not opened from here.",
    );
    await expect(hostile.getByRole("link")).toHaveCount(0);
    await hostile.getByText("javascript:document.title").click();
    await hostile.getByText("data:text/html").click();
  });

  await test.step("targets that name no repository file or web address", async () => {
    const noFile = "This does not name a file inside the observed repository.";
    for (const [name, recorded, reason] of [
      ["Reach outside the repository", "../../elsewhere/secret.md#top", noFile],
      ["Spell a path that cannot be decoded", "seeds/%E0%A4%A.md", noFile],
      ["Point at an anchor and no file", "#see-published-work", noFile],
      ["Walk back to the planning directory", "seeds/..#top", noFile],
      [
        "Name a web address without a host",
        "https://",
        "This is not a complete web address.",
      ],
    ] as const) {
      const entry = card(stages, name);
      await expect(entry).toContainText(`Canonical record ${recorded}`);
      await expect(entry).toContainText(`Not offered as a link. ${reason}`);
      await expect(entry.getByRole("link")).toHaveCount(0);
    }
  });

  await test.step("recorded text is shown as text and nothing runs", async () => {
    await expect(
      stages.getByRole("heading", {
        name: `<img src=x onerror="document.title='title ran'">Run a script from a link`,
      }),
    ).toBeVisible();
    await openDirection(page);
    await expect(parts(page).direction).toContainText(
      `<img src=x onerror="document.title='direction ran'">`,
    );
    await expect(page.locator("img, script:not([src])")).toHaveCount(0);
    const anchors = await page.locator("a[href]").all();
    const schemes = await Promise.all(
      anchors.map(async (anchor) => (await destination(anchor)).protocol),
    );
    expect(new Set(schemes)).toEqual(new Set(["https:", "http:"]));
    expect(dialogs).toEqual([]);
    expect({ title: await page.title(), url: page.url() }).toEqual(opened);
  });
});
