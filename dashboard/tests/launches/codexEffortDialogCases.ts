// Effort dialog cases registered by agent-launch-codex-model.spec.ts. None
// starts installed work, so each reads the worker's launch journey.
import path from "node:path";
import { test, expect } from "../support/codexLaunch.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import { twiceZoomedWindow } from "../accessibleReading.ts";

test("model changes preserve compatible effort and retain incompatible selection with linked keyboard feedback", async ({
  page,
  launchJourney,
}) => {
  await openTakenBacklog(page, launchJourney);
  const open = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await open.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  const model = dialog.getByLabel("Model", { exact: true });
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await model.selectOption("native-sol");
  await expect(effort.locator("option")).toHaveText([
    "Use Codex setting",
    "low — Quick",
    "ultra — Deep",
  ]);
  await effort.selectOption("ultra");
  await model.selectOption("native-luna");
  await expect(effort).toHaveValue("ultra");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  const feedback = await effort.getAttribute("aria-describedby");
  if (!feedback) throw new Error("Effort feedback missing");
  await expect(page.locator(`[id="${feedback}"]`)).toContainText(
    "cannot be verified",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await effort.selectOption("low");
  await model.selectOption("native-sol");
  await expect(effort).toHaveValue("low");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await dialog.getByRole("textbox").focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Record", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Attach images" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByLabel("Host", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(model).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(effort).toBeFocused();
  await effort.selectOption("");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await model.selectOption("native-luna");
  await effort.selectOption("low");
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  await expect(effort).toHaveCount(0);
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect(effort).toHaveValue("");
  await model.selectOption("native-sol");
  await effort.selectOption("ultra");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await open.click();
  await expect(effort).toHaveValue("");
  await expect(model).toHaveValue("");
  await page.keyboard.press("Escape");
});

test("unknown configured custom model leaves defaults usable and efforts delegated; narrow and 200% reading retains Start", async ({
  page,
  launchJourney,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  native.configuredModel = "custom-model";
  await openTakenBacklog(page, launchJourney);
  await page.setViewportSize({ width: 390, height: 600 });
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await expect(effort.locator("option")).toHaveCount(3);
  await expect(dialog).toContainText(
    "Codex resolves its configured reasoning effort in the launch workspace",
  );
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toBeEnabled();
  await expect(start).toBeInViewport();
  await effort.selectOption("ultra");
  await expect(dialog).toContainText(
    "will be verified there before initial input",
  );
  await page.setViewportSize(twiceZoomedWindow);
  await expect(start).toBeInViewport();
  await effort.selectOption("");
  await expect(start).toBeEnabled();
  await page.keyboard.press("Escape");
});

test("stale explicit effort is explained and a deliberate default retry sends neither override", async ({
  page,
  dashboard,
  launchJourney,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  await openTakenBacklog(page, launchJourney);
  const open = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  const dialog = page.getByRole("dialog");
  await open.click();
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  native.models = native.models.map((item) => ({
    ...item,
    supportedReasoningEfforts: item.supportedReasoningEfforts.filter(
      (item) => item.reasoningEffort !== "ultra",
    ),
  }));
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".start-session-answer")).toContainText(
    "no longer supported",
  );
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  native.catalogError = { code: -32000, message: "Unavailable" };
  await open.click();
  await expect(
    dialog.getByRole("button", { name: "Retry model choices" }),
  ).toBeVisible();
  await expect(
    dialog.getByLabel("Reasoning effort", { exact: true }),
  ).toHaveValue("");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => native.calls.filter((c) => c.method === "thread/start").length)
    .toBe(1);
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({ cwd: path.join(dashboard.home, "git", "open-dough") });
});
