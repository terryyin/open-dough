// Real dialogs, installed starts, stores and native requests. The substitute
// supplies catalog pages and native identities, never dashboard records.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";

for (const workflow of ["execution", "refinement", "ad-hoc"] as const) {
  test(`${workflow} chooses a discovered model before preparation and native creation`, async ({
    page,
    dashboard,
    origin,
    codexProtocol: fixture,
  }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const codexProtocol = fixture;
    codexProtocol.modelPageSize = 1;
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: (await origin.originGit("rev-parse", "main")).trim(),
      repository: "terryyin/open-dough",
      follows: true,
    });
    await page.goto("/");
    if (workflow === "ad-hoc")
      await page
        .getByRole("button", { name: "Start session in Open Dough" })
        .click();
    else
      await parts(page)
        .backlog.getByRole("article", { name: "Story A", exact: true })
        .getByRole("button", { name: `Start ${workflow}` })
        .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    const models = dialog.getByLabel("Model", { exact: true });
    await expect(models.locator("option")).toHaveText([
      "Use Codex setting",
      "Native Sol",
      "Native Luna",
    ]);
    await models.selectOption("native-luna");
    await dialog
      .getByLabel("Reasoning effort", { exact: true })
      .selectOption("low");
    await expect(dialog).toContainText("Host supplied Luna description");
    if (workflow !== "ad-hoc")
      codexProtocol.beforeInput = () => {
        const starts: unknown = JSON.parse(
          readFileSync(
            path.join(
              dashboard.home,
              `.open-dough/dashboard/${workflow}-starts.json`,
            ),
            "utf8",
          ),
        );
        expect(starts).toMatchObject({
          "open-dough": { "SEED-A#a": { model: "native-luna", effort: "low" } },
        });
      };
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(
        () =>
          existsSync(
            path.join(
              dashboard.home,
              ".open-dough/dashboard/agent-launches.json",
            ),
          )
            ? stored(dashboard.home)[0]?.firstInput?.state
            : undefined,
        { timeout: 30_000 },
      )
      .toBe(workflow === "ad-hoc" ? "not-requested" : "confirmed");
    const record = stored(dashboard.home)[0];
    expect(record?.request.model).toBe("native-luna");
    expect(record?.request.effort).toBe("low");
    const workspace =
      workflow === "ad-hoc"
        ? origin.project
        : path.join(origin.project, ".worktrees/story-a");
    expect(
      codexProtocol.calls.filter((c) => c.method === "thread/start"),
    ).toEqual([
      {
        method: "thread/start",
        params: {
          cwd: workspace,
          model: "native-luna",
          config: { model_reasoning_effort: "low" },
        },
      },
    ]);
    if (workflow === "ad-hoc") {
      expect(
        codexProtocol.calls.filter((c) => c.method === "turn/start"),
      ).toEqual([]);
      expect(record?.firstInput).toMatchObject({
        state: "not-requested",
        intent: "blank",
      });
    } else {
      await expect
        .poll(() => stored(dashboard.home)[0]?.firstInput?.state)
        .toBe("confirmed");
      expect(await origin.takenProfiles()).toEqual([
        expect.objectContaining({ host: "codex", model: "native-luna" }),
      ]);
      expect(
        record?.[workflow === "execution" ? "start" : "preparation"]?.workspace,
      ).toBe(workspace);
    }
    expect(
      codexProtocol.calls.some(
        (c) => c.method === "model/list" && c.params["cursor"] === "1",
      ),
    ).toBe(true);
  });
}

import "./codexModelCatalogCases.ts";

import "./codexEffortDialogCases.ts";

import "./codexEffortWorkspaceCases.ts";
