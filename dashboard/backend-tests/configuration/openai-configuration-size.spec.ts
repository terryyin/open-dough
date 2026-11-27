import { existsSync, readFileSync, statSync } from "node:fs";
import { afterEach, beforeEach, expect, test } from "vitest";
import { installOpenAIConfigurationMiddleware } from "../../server/openAIConfigurationBoundary.ts";
import { openAICredentialFile } from "../../server/openAICredential.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

let machine: PrivateSettingsMachine;
let server: InProcessBoundaryHttp;
beforeEach(async () => {
  machine = privateSettingsMachine();
  server = await startInProcessBoundaryHttp(
    {
      name: "dough-openai-configuration",
      install: installOpenAIConfigurationMiddleware,
    },
    "production",
  );
});
afterEach(async () => {
  try {
    await server.closeBoundary();
    await server.closeHttp();
  } finally {
    machine.close();
  }
});

test("an exactly admitted ASCII or UTF-8 credential remains readable and replaceable", async () => {
  const endpoint = `${server.origin}/__openai-configuration`;
  const headers = {
    Origin: server.origin,
    "Content-Type": "application/json",
  };
  const available =
    32 * 1024 - Buffer.byteLength(JSON.stringify({ apiKey: "" }));
  const utf8Key =
    "界".repeat(Math.floor(available / 3)) + "x".repeat(available % 3);
  for (const apiKey of ["x".repeat(available), utf8Key]) {
    const body = JSON.stringify({ apiKey });
    expect(Buffer.byteLength(body)).toBe(32 * 1024);
    const saved = await rawRequest({
      url: `${endpoint}/save`,
      method: "POST",
      headers,
      body,
    });
    expect(saved.status).toBe(200);
    expect(JSON.parse(saved.body)).toEqual({ configured: true });
    expect(statSync(openAICredentialFile()).size).toBe(32 * 1024 + 1);
    const status = await rawRequest({ url: endpoint, headers });
    expect(status.status).toBe(200);
    expect(JSON.parse(status.body)).toEqual({ configured: true });
    expect(JSON.parse(readFileSync(openAICredentialFile(), "utf8"))).toEqual({
      apiKey,
    });
  }
  const replacement = "sk-synthetic-boundary-replacement-084";
  const replaced = await rawRequest({
    url: `${endpoint}/save`,
    method: "POST",
    headers,
    body: JSON.stringify({ apiKey: replacement }),
  });
  expect(replaced.status).toBe(200);
  expect(JSON.parse(readFileSync(openAICredentialFile(), "utf8"))).toEqual({
    apiKey: replacement,
  });
  expect((await rawRequest({ url: endpoint, headers })).status).toBe(200);
  const removed = await rawRequest({
    url: `${endpoint}/remove`,
    method: "POST",
    headers,
    body: "{}",
  });
  expect(removed.status).toBe(200);
  expect(JSON.parse(removed.body)).toEqual({ configured: false });
  expect(existsSync(openAICredentialFile())).toBe(false);
  const empty = await rawRequest({ url: endpoint, headers });
  expect(empty.status).toBe(200);
  expect(JSON.parse(empty.body)).toEqual({ configured: false });
  expect(machine.egress).toEqual([]);
  expect(machine.logged.join("\n")).not.toContain(replacement);
});
