import { openDirection, parts } from "../../tests/dashboardPage.ts";
import {
  canonicalRecord,
  slicePlanLink,
} from "../../tests/storyCardControls.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  card,
  clickRefusedTargets,
  destination,
  followLeavingDashboard,
  forEachStoryCardsSources,
  injectedMarkup,
  inspectedSources,
  openDashboard,
  revision,
} from "../../tests/support/frontendSourceNavigation.ts";

test("source navigation keeps an external reference apart from files in this snapshot", async ({
  page,
  frontendServices,
}) => {
  const { board } = await openDashboard(page, frontendServices);
  const note = await inspectedSources(
    card(board, "Read the hosting provider's note"),
  );

  const canonical = canonicalRecord(note);
  await expect(canonical).toHaveAttribute(
    "href",
    "https://status.example.com/notes/2026-09?view=full#api",
  );
  await expect(slicePlanLink(note)).toHaveAttribute(
    "href",
    "http://plans.example.org/note-7",
  );
  await expect(
    note.getByText(
      "External reference. It is not a file in this snapshot and is not tied to the inspected revision.",
    ),
  ).toHaveCount(2);
  await expect(note).not.toContainText("File in this snapshot");
  await expect(note).not.toContainText(revision.slice(0, 7));

  await test.step("following an external reference opens in a new tab while dashboard stays in place", async () => {
    const dest = await followLeavingDashboard(page, canonical, "Open Dough");
    expect(dest.origin).toBe("https://status.example.com");
    expect(dest.pathname).toBe("/notes/2026-09");
    expect(dest.search).toBe("?view=full");
  });
});

test("source navigation shows unsafe or invalid targets as text that cannot be followed", async ({
  page,
  frontendServices,
}) => {
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  const { board } = await openDashboard(page, frontendServices);
  const opened = { title: await page.title(), url: page.url() };

  await test.step("script and data schemes stay readable and are not links", async () => {
    const hostile = await inspectedSources(
      card(board, /Run a script from a link/),
    );
    await expect(hostile).toContainText(
      "Canonical record javascript:document.title='canonical-ran'",
    );
    await expect(hostile).toContainText(
      "Slice plan data:text/html,<script>document.title='plan-ran'</script>",
    );
    await expect
      .soft(hostile)
      .toContainText(
        "Not offered as a link. Links that use “javascript:” are not opened from here.",
      );
    await expect(hostile).toContainText(
      "Not offered as a link. Links that use “data:” are not opened from here.",
    );
    await expect(hostile.getByRole("link")).toHaveCount(0);
    await clickRefusedTargets(hostile, [
      "javascript:document.title",
      "data:text/html",
    ]);
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
      const entry = await inspectedSources(card(board, name));
      await expect(entry).toContainText(`Canonical record ${recorded}`);
      await expect(entry).toContainText(`Not offered as a link. ${reason}`);
      await expect(entry.getByRole("link")).toHaveCount(0);
    }
  });

  await test.step("recorded text is shown as text and nothing runs", async () => {
    await expect(
      board.getByRole("heading", {
        name: `<img src=x onerror="document.title='title ran'">Run a script from a link`,
      }),
    ).toBeVisible();
    await openDirection(page);
    await expect(parts(page).direction).toContainText(
      `<img src=x onerror="document.title='direction ran'">`,
    );
    await expect(page.locator(injectedMarkup)).toHaveCount(0);
    // Every card's links, each read in its detail.
    const schemes: string[] = [];
    await forEachStoryCardsSources(board, async (sources) => {
      for (const anchor of await sources.locator("a[href]").all()) {
        schemes.push((await destination(anchor)).protocol);
      }
      await expect(page.locator(injectedMarkup)).toHaveCount(0);
    });
    expect(new Set(schemes)).toEqual(new Set(["https:", "http:"]));
    expect(dialogs).toEqual([]);
    expect({ title: await page.title(), url: page.url() }).toEqual(opened);
  });
});
