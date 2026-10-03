import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { settings, back } from "./support/systemSettingsPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("project settings errors retain the form draft and predecessor and allow explicit retry", async ({
  page,
}) => {
  const server = await fixture.start("dev");
  await page.goto(`${server.baseURL}/?view=settings`);
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add project", exact: true });
  const url = dialog.getByRole("textbox", { name: "GitHub URL" });
  await url.fill("not a repository");
  await dialog
    .getByRole("textbox", { name: "Local path" })
    .fill("~/work/private-checkout");
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(url).toHaveValue("not a repository");
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toEqual([]);
  await url.fill("https://github.com/example/sample-app");
  await dialog
    .getByRole("textbox", { name: "Local path" })
    .fill("~/work/private-checkout");
  const file = fixture.configurationFile("dev");
  const predecessor = readFileSync(file, "utf8");
  chmodSync(path.dirname(file), 0o500);
  try {
    await dialog.getByRole("button", { name: "Add", exact: true }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(url).toHaveValue("https://github.com/example/sample-app");
    await expect(
      dialog.getByRole("textbox", { name: "Local path" }),
    ).toHaveValue("~/work/private-checkout");
    expect(readFileSync(file, "utf8")).toBe(predecessor);
  } finally {
    chmodSync(path.dirname(file), 0o700);
  }
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Sample App", exact: true }),
  ).toBeVisible();
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toHaveLength(1);
});

test("failed row removal keeps configuration, confirmation feedback and retry", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings&project=pygardon`);
  const file = fixture.configurationFile("preview");
  const predecessor = readFileSync(file, "utf8");
  await page
    .getByRole("button", { name: "Remove project Pygardon", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Remove Pygardon?",
    exact: true,
  });
  chmodSync(path.dirname(file), 0o500);
  try {
    await dialog.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    expect(readFileSync(file, "utf8")).toBe(predecessor);
  } finally {
    chmodSync(path.dirname(file), 0o700);
  }
  await dialog.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Remove project Pygardon", exact: true }),
  ).toHaveCount(0);
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
});

test("long configured facts reflow at narrow width and 200 percent zoom with keyboard return", async ({
  page,
}, testInfo) => {
  const file = fixture.configurationFile("dev");
  mkdirSync(path.dirname(file), { recursive: true });
  const repository = `example/${"long-repository-name-".repeat(8)}project`;
  const localPath = `/Users/developer/${"long-checkout-directory/".repeat(10)}project`;
  writeFileSync(
    file,
    JSON.stringify([
      {
        id: "long-project",
        label: "Long Project",
        repository,
        localPath,
        ref: "main",
        backlogPath: ".planning/PRODUCT-BACKLOG.md",
      },
    ]),
  );
  const server = await fixture.start("dev");
  await page.goto(server.baseURL);
  await settings(page).focus();
  await page.keyboard.press("Enter");
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByRole("listitem")).toContainText(localPath);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("settings-narrow.png"),
    fullPage: true,
  });
  // CSS zoom doubles every rendered dimension; 720 physical pixels leave the
  // same 360 CSS-pixel reading width as a 200% browser zoom.
  await page.setViewportSize({ width: 720, height: 1000 });
  await page.addStyleTag({ content: "html { zoom: 2; }" });
  await expect(page.getByRole("listitem")).toContainText(localPath);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("settings-narrow-200-percent.png"),
    fullPage: true,
  });
  await back(page).focus();
  await page.keyboard.press("Enter");
  await expect(settings(page)).toBeFocused();
});
