// The page's recovery from a saved OpenAI credential it cannot use. What the
// OpenAI configuration boundary refuses, and that no refusal touches the
// private file or a provider, is ./boundary/openai-configuration-boundary.spec.ts.
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());
const key = "sk-synthetic-private-boundary-084";

test("malformed and unreadable saved credentials report configuration problems without reseeding, echoing secrets, or importing an environment key", async ({
  page,
}) => {
  mkdirSync(fixture.credentialDirectory, { recursive: true, mode: 0o700 });
  const malformed = `{"apiKey":"${key}"`;
  writeFileSync(fixture.credentialFile, malformed, { mode: 0o600 });
  const server = await fixture.start("preview");
  const options = {
    url: `${server.baseURL}/__openai-configuration`,
    headers: { Origin: server.origin },
  };
  const response = await rawRequest(options);
  expect(response.status).toBe(503);
  expect(response.body).toContain("could not be read");
  expect(response.body).not.toContain(key);
  expect(readFileSync(fixture.credentialFile, "utf8")).toBe(malformed);
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(page.getByRole("alert")).toContainText(
    "replace it, or remove it",
  );
  await expect(page.getByLabel("API key", { exact: true })).toHaveValue("");
  await page.getByLabel("API key", { exact: true }).fill(key);
  await page.getByRole("button", { name: "Save API key", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Configured");
  const before = readFileSync(fixture.credentialFile, "utf8");
  chmodSync(fixture.credentialFile, 0o000);
  try {
    const unreadable = await rawRequest(options);
    expect(unreadable.status).toBe(503);
    expect(unreadable.body).toContain("file permissions");
    expect(unreadable.body).not.toContain(key);
    await page.reload();
    await expect(page.getByRole("alert")).toContainText("could not be read");
  } finally {
    chmodSync(fixture.credentialFile, 0o600);
  }
  expect(readFileSync(fixture.credentialFile, "utf8")).toBe(before);
  await page.getByRole("button", { name: "Retry status", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Configured");
  await page
    .getByRole("button", { name: "Remove API key", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Not configured");
  expect(existsSync(fixture.credentialFile)).toBe(false);
  expect(fixture.egress()).toBe("");
  expect(server.output()).not.toContain(key);
});
