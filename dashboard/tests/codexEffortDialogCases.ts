import { test, expect } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";

test("model changes preserve compatible effort and retain incompatible selection with linked keyboard feedback", async ({
  page,
  origin,
}) => {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
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
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  native.configuredModel = "custom-model";
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
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
  // Existing launch-layout convention: 1280×900 at 200% gives 640×450 CSS pixels.
  await page.setViewportSize({ width: 640, height: 450 });
  await expect(start).toBeInViewport();
  await effort.selectOption("");
  await expect(start).toBeEnabled();
  await page.keyboard.press("Escape");
});

test("stale explicit effort is explained and a deliberate default retry sends neither override", async ({
  page,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
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
  ).toEqual({ cwd: origin.project });
});

test("workspace confirmation keeps model and effort through Back and Continue", async ({
  page,
  dashboard,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  const { appendFileSync, existsSync } = await import("node:fs");
  const { openBacklog, radio } = await import("./support/sessionDialog.ts");
  const { stored } = await import("./support/codexStart.ts");
  const card = await openBacklog(page, origin);
  appendFileSync(`${origin.project}/.gitignore`, "tmp/\n");
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  await radio(dialog, "Tracking", "One-shot").check();
  await radio(dialog, "Workspace", "Default main").check();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "Existing changes in default main" }),
  ).toBeVisible();
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  await dialog.getByRole("button", { name: "Back", exact: true }).click();
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue(
    "native-sol",
  );
  await expect(
    dialog.getByLabel("Reasoning effort", { exact: true }),
  ).toHaveValue("ultra");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Continue with existing changes" })
    .click();
  await expect
    .poll(
      () =>
        existsSync(
          `${dashboard.home}/.open-dough/dashboard/agent-launches.json`,
        )
          ? stored(dashboard.home)[0]?.firstInput?.state
          : undefined,
      { timeout: 30_000 },
    )
    .toBe("confirmed");
  expect(stored(dashboard.home)[0]?.request).toMatchObject({
    model: "native-sol",
    effort: "ultra",
  });
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({
    cwd: origin.project,
    model: "native-sol",
    config: { model_reasoning_effort: "ultra" },
  });
});
