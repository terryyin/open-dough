import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { apiKey, save, status } from "./support/openAISettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());
const key = "sk-synthetic-held-status-084";

for (const operation of ["save", "remove", "save after read error"] as const) {
  test(`a held real status response cannot overwrite successful ${operation}`, async ({
    page,
  }) => {
    if (operation === "save after read error") {
      mkdirSync(fixture.credentialDirectory, { recursive: true, mode: 0o700 });
      writeFileSync(fixture.credentialFile, "{malformed", { mode: 0o600 });
    }
    const server = await fixture.start("dev");
    if (operation === "remove") {
      await page.goto(`${server.baseURL}/?view=settings`);
      await expect(status(page)).toHaveText("API key: Not configured");
      await apiKey(page).fill(key);
      await save(page).click();
      await expect(status(page)).toHaveText("API key: Configured");
      await save(page).click();
      await expect(page.getByRole("alert")).toContainText("Enter an API key");
    }
    let release: () => void = () => {
      throw new Error("No status response is held.");
    };
    let captured: () => void = () => {
      throw new Error("No status response was requested.");
    };
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const ready = new Promise<void>((resolve) => {
      captured = resolve;
    });
    let delivered: () => void = () => {
      throw new Error("No status response was delivered.");
    };
    const delivery = new Promise<void>((resolve) => {
      delivered = resolve;
    });
    await page.route("**/__openai-configuration", async (route) => {
      // Obtain the real local service's snapshot before the mutation, then hold
      // only its delivery. The response and private persistence are not faked.
      const response = await route.fetch({
        headers: { ...route.request().headers(), Origin: server.origin },
      });
      expect(response.status()).toBe(
        operation === "save after read error" ? 503 : 200,
      );
      if (response.ok())
        expect(await response.json()).toEqual({
          configured: operation === "remove",
        });
      captured();
      await held;
      await route.fulfill({ response });
      delivered();
    });
    if (operation === "remove")
      await page
        .getByRole("button", { name: "Retry status", exact: true })
        .click();
    else await page.goto(`${server.baseURL}/?view=settings`);
    await ready;
    if (operation === "remove")
      await page
        .getByRole("button", { name: "Remove API key", exact: true })
        .click();
    else {
      await apiKey(page).fill(key);
      await save(page).click();
    }
    const expected =
      operation === "remove"
        ? "API key: Not configured"
        : "API key: Configured";
    await expect(status(page)).toHaveText(expected);
    release();
    await delivery;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    await expect(status(page)).toHaveText(expected);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(apiKey(page)).toHaveValue("");
    if (operation === "remove")
      expect(existsSync(fixture.credentialFile)).toBe(false);
    else
      expect(JSON.parse(readFileSync(fixture.credentialFile, "utf8"))).toEqual({
        apiKey: key,
      });
    expect(await page.locator("body").textContent()).not.toContain(key);
    expect(server.output()).not.toContain(key);
    expect(fixture.egress()).toBe("");
  });
}
