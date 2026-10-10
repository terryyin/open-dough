// Navigating with Running Cursor sessions in the Sessions sidebar. Choosing a
// held row opens that client's terminal as the runner spec does
// (./cursor-runner-sessions.spec.ts), on a narrow window closing the sidebar
// lying over the page, while the saved session stays the session list's own.
// Expansion lasts for the page, across project and view changes and closing
// the sidebar, but a reload starts collapsed. The section's layout is
// ./cursor-sidebar-panels.spec.ts's.
import { parts } from "./dashboardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  changesAsked,
  holdSession,
  instruction,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

const wide = { width: 1440, height: 900 };

test.use({ cursorScreen: "working" });

for (const { name, size } of [
  { name: "a wide window", size: wide },
  { name: "a narrow window", size: { width: 700, height: 900 } },
]) {
  test(`in ${name}, choosing a held row opens that client's terminal`, async ({
    page,
    dashboard,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(size);
    const pid = await holdSession(dashboard, cursor);
    await showPage(page, origin);
    const { sidebar, button, entries, header, region, list } =
      runningCursorParts(page);
    const terminal = page.getByRole("region", { name: "Terminal" });
    await button.click();
    await header.click();
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("working");
    // The saved session stays the session list's one entry beside its row.
    await expect(entries).toHaveCount(1);
    await expect(
      list.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();
    await expect(terminal).toHaveCount(0);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);

    await row.click();
    await expect(terminal.locator(".xterm-rows")).toContainText(
      "ctrl+c to stop",
    );
    expect(
      await terminal.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
    if (size.width <= 800) {
      await expect(sidebar).toBeHidden();
    } else {
      await expect(sidebar).toBeVisible();
      await expect(header).toHaveAttribute("aria-expanded", "true");
    }
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  });
}

test.describe("with two projects", () => {
  test.use({ projectFolders: ["open-dough", "pygardon"] });

  test("expansion survives project and view changes and closing the sidebar, and a reload starts collapsed", async ({
    page,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(wide);
    const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
    pygardon.push(
      "e6".repeat(20),
      "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
    );
    const asked = changesAsked(page);
    await showPage(page, origin);
    const { sidebar, button, header, body } = runningCursorParts(page);
    const { project, backlog } = parts(page);
    const expanded = async () => {
      await expect(header).toHaveAttribute("aria-expanded", "true");
      await expect(body).toBeVisible();
    };
    await button.click();
    await header.click();
    await expanded();

    await test.step("choosing another project keeps it expanded", async () => {
      await project.getByRole("radio", { name: "Pygardon" }).check();
      await expect(backlog).toContainText("A Pygardon story");
      await expanded();
    });

    await test.step("System settings and back keeps it expanded", async () => {
      await page
        .getByRole("button", { name: "System settings", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "System settings", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Back to dashboard", exact: true })
        .click();
      await expect(backlog).toContainText("A Pygardon story");
      await expanded();
    });

    await test.step("closing and reopening the sidebar keeps it expanded", async () => {
      await button.click();
      await expect(sidebar).toBeHidden();
      await button.click();
      await expanded();
    });

    await test.step("a reload starts it collapsed", async () => {
      await page.reload();
      await expect(sidebar).toBeVisible();
      await expect(header).toHaveAttribute("aria-expanded", "false");
      await expect(body).toHaveCount(0);
    });

    expect(asked).toEqual([]);
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
  });
});
