// Effort-only launches resolve their configured model in the actual workspace.
import { test, expect } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";

test("effort-only story startup validates the actual established workspace rather than the project folder", async ({
  page,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const native = fixture;
  const { openBacklog } = await import("./support/sessionDialog.ts");
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
  const { existsSync } = await import("node:fs");
  const { stored } = await import("./support/codexStart.ts");
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
      existsSync(`${dashboard.home}/.open-dough/dashboard/agent-launches.json`)
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
  expect(
    native.calls.filter((c) => c.method === "turn/start")[0]?.params,
  ).toEqual({
    threadId: native.threadId,
    input: [{ type: "text", text: "Explain the build" }],
  });
});
