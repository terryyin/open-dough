// Codex effort launches with real dialogs, stores and native requests. A
// stale explicit effort is refused before native creation and a deliberate
// default retry sends neither override (on the worker's launch journey);
// effort-only launches that start installed work resolve their configured
// model in the actual workspace, and workspace confirmation keeps the chosen
// model and effort. Effort choices in the dialog alone are
// ../../dashboard/frontend-tests/launches/launch-native-effort.spec.ts.
import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { test as journeyTest } from "../../dashboard/test-support/support/codexLaunch.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { launchStoreFile } from "../../dashboard/test-support/support/launchStore.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { expectAdHocReportingInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  openBacklog,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";

// codexLaunch.ts gives no project folder; Start session needs the one an
// installed origin makes.
test.use({ projectFolders: ["open-dough"] });

journeyTest(
  "stale explicit effort is explained and a deliberate default retry sends neither override",
  async ({ page, dashboard, launchJourney, codexProtocol: fixture }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const native = fixture;
    await openTakenBacklog(page, launchJourney);
    const open = page.getByRole("button", {
      name: "Start session in Open Dough",
    });
    const dialog = page.getByRole("dialog");
    await open.click();
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    await dialog
      .getByLabel("Model", { exact: true })
      .selectOption("native-sol");
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
      .poll(
        () => native.calls.filter((c) => c.method === "thread/start").length,
      )
      .toBe(1);
    expect(
      native.calls.filter((c) => c.method === "thread/start")[0]?.params,
    ).toEqual({ cwd: path.join(dashboard.home, "git", "open-dough") });
  },
);

test("effort-only story startup validates the actual established workspace rather than the project folder", async ({
  page,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  const workspace = `${origin.project}/.worktrees/story-a`;
  native.configuredModels = {
    [origin.project]: "native-sol",
    [workspace]: "native-luna",
  };
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  await expect(dialog).toContainText(
    "configured model in the launch workspace",
  );
  expect(native.calls.filter((c) => c.method === "config/read")).toEqual([]);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(card).toContainText("launch workspace's model", {
    timeout: 30_000,
  });
  expect(
    native.calls.filter((c) => c.method === "config/read").map((c) => c.params),
  ).toEqual([{ cwd: workspace, includeLayers: false }]);
  expect(native.calls.filter((c) => c.method === "thread/start")).toEqual([]);
  expect(native.calls.filter((c) => c.method === "turn/start")).toEqual([]);
});

test("effort-only ad hoc dialog uses the configured model while omitting model override", async ({
  page,
  dashboard,
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
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  await dialog.getByRole("textbox").fill("Explain the build");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() =>
      existsSync(launchStoreFile(dashboard.home))
        ? stored(dashboard.home)[0]?.firstInput?.state
        : undefined,
    )
    .toBe("confirmed");
  expect(stored(dashboard.home)[0]?.request).toMatchObject({ effort: "ultra" });
  expect(stored(dashboard.home)[0]?.request).not.toHaveProperty("model");
  expect(
    native.calls.filter((c) => c.method === "thread/start")[0]?.params,
  ).toEqual({
    cwd: origin.project,
    config: { model_reasoning_effort: "ultra" },
  });
  const turns = native.calls.filter((c) => c.method === "turn/start");
  expect(turns).toHaveLength(1);
  const input = turns[0]?.params["input"] as { type: string; text: string }[];
  const text = input[0]?.text ?? "";
  expectAdHocReportingInput(
    text,
    "Explain the build",
    stored(dashboard.home)[0]?.request,
    dashboard,
  );
  expect(turns[0]?.params).toEqual({
    threadId: native.threadId,
    input: [{ type: "text", text }],
  });
});

test("workspace confirmation keeps model and effort through Back and Continue", async ({
  page,
  dashboard,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
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
        existsSync(launchStoreFile(dashboard.home))
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
