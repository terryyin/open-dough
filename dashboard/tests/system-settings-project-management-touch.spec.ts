// Touch project editing retains its draft, predecessor and explicit recovery
// while the viewport changes and local writes fail.
import { chmodSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { readSetting } from "./support/settingsTouchPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} project settings editing`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch edits at reduced height, cancels without writes, and retries a real failed save with the exact draft", async ({
    page,
  }) => {
    const server = await fixture.start("preview");
    await page.goto(`${server.baseURL}/?view=settings`);
    const file = fixture.configurationFile("preview");
    const predecessor = readFileSync(file, "utf8");
    const addProject = page.getByRole("button", {
      name: "Add project",
      exact: true,
    });
    const dialog = page.getByRole("dialog", {
      name: "Add project",
      exact: true,
    });
    const url = dialog.getByRole("textbox", {
      name: "GitHub URL",
      exact: true,
    });
    const local = dialog.getByRole("textbox", {
      name: "Local path",
      exact: true,
    });
    const repository = "https://github.com/example/sample-app";
    const checkout = "~/work/private-checkout";
    await tapWhereShown(addProject);
    await expect(url).toBeFocused();
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await url.scrollIntoViewIfNeeded();
    await tapWhereShown(url);
    await url.pressSequentially(repository);
    await local.scrollIntoViewIfNeeded();
    await tapWhereShown(local);
    await local.fill(checkout);
    await page.setViewportSize(landscape);
    await expect(url).toHaveValue(repository);
    await expect(local).toHaveValue(checkout);
    expect(readFileSync(file, "utf8")).toBe(predecessor);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    // A long single-line input scrolls its own value, as on desktop; the
    // dialog and its ordinary reading body must still fit the page.
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await dialog
        .locator(".launch-dialog-body")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await tapWhereShown(
      dialog.getByRole("button", { name: "Cancel", exact: true }),
    );
    await expect(dialog).toBeHidden();
    await expect(addProject).toBeFocused();
    expect(readFileSync(file, "utf8")).toBe(predecessor);

    await page.setViewportSize(portrait);
    await tapWhereShown(addProject);
    await url.fill(repository);
    await local.fill(checkout);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await local.scrollIntoViewIfNeeded();
    await tapWhereShown(local);
    await expect(local).toBeFocused();
    chmodSync(path.dirname(file), 0o500);
    try {
      await tapWhereShown(
        dialog.getByRole("button", { name: "Add", exact: true }),
      );
      await expect(dialog.getByRole("alert")).toBeVisible();
      await readSetting(dialog.getByRole("alert"));
      await expect(url).toHaveValue(repository);
      await expect(local).toHaveValue(checkout);
      expect(readFileSync(file, "utf8")).toBe(predecessor);
      await page.setViewportSize(landscape);
      await expect(url).toHaveValue(repository);
      await expect(local).toHaveValue(checkout);
    } finally {
      chmodSync(path.dirname(file), 0o700);
    }
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await tapWhereShown(
      dialog.getByRole("button", { name: "Add", exact: true }),
    );
    await expect(dialog).toBeHidden();
    const saved = JSON.parse(readFileSync(file, "utf8")) as readonly unknown[];
    expect(saved).toHaveLength(
      (JSON.parse(predecessor) as unknown[]).length + 1,
    );
    expect(saved.at(-1)).toMatchObject({
      repository: "example/sample-app",
      localPath: checkout,
      ref: "release+stable",
    });
    const afterAdd = readFileSync(file, "utf8");
    const row = page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Sample App", exact: true }),
    });
    await readSetting(row.locator("dd").last());
    const removeProject = row.getByRole("button", {
      name: "Remove project Sample App",
      exact: true,
    });
    const removal = page.getByRole("dialog", {
      name: "Remove Sample App?",
      exact: true,
    });
    await tapWhereShown(removeProject);
    await tapWhereShown(
      removal.getByRole("button", { name: "Cancel", exact: true }),
    );
    await expect(removal).toBeHidden();
    await expect(removeProject).toBeFocused();
    expect(readFileSync(file, "utf8")).toBe(afterAdd);
    await tapWhereShown(removeProject);
    chmodSync(path.dirname(file), 0o500);
    try {
      await tapWhereShown(
        removal.getByRole("button", { name: "Remove", exact: true }),
      );
      await expect(removal.getByRole("alert")).toBeVisible();
      await readSetting(removal.getByRole("alert"));
      expect(readFileSync(file, "utf8")).toBe(afterAdd);
    } finally {
      chmodSync(path.dirname(file), 0o700);
    }
    await tapWhereShown(
      removal.getByRole("button", { name: "Remove", exact: true }),
    );
    await expect(removal).toBeHidden();
    expect(readFileSync(file, "utf8")).toBe(predecessor);
    expect(existsSync(fixture.configurationFile("dev"))).toBe(false);
    expect(
      existsSync(
        path.join(
          fixture.machine,
          "home/.open-dough/dashboard/credentials/openai.json",
        ),
      ),
    ).toBe(false);
    expect(
      existsSync(
        path.join(
          fixture.machine,
          "home/.open-dough/dashboard/terminal-theme.json",
        ),
      ),
    ).toBe(false);
    expect(server.claudeCalls()).toEqual([]);
  });
});
