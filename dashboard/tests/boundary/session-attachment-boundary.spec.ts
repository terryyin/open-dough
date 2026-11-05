// Real local upload admission and the files retained by the machine server.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/codexLaunch.ts";
import { launch, refinementRequest } from "../agentLaunchBoundary.ts";
import { launched } from "../agentTerminalBoundary.ts";
import { sessionAttachmentEndpoint } from "../../src/agentTerminal.ts";
import {
  launchAttachmentEmpty,
  launchAttachmentNameHeader,
  launchAttachmentTooLarge,
  launchAttachmentUnsupportedType,
} from "../../src/launchAttachments.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  listedMachineDirs,
  pngA,
  pngB,
} from "../support/launchAttachmentFixtures.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.use({ projectFolders: ["open-dough"], serverMode: "boundary" });

function attachmentsRoot(server: DashboardServer): string {
  return path.join(
    server.home,
    ".open-dough",
    "dashboard",
    "session-attachments",
  );
}

function attachmentUrl(
  server: DashboardServer,
  session: string,
  host = "claude",
): string {
  const url = new URL(sessionAttachmentEndpoint, server.baseURL);
  url.search = new URLSearchParams({
    source: "open-dough",
    host,
    session,
  }).toString();
  return url.href;
}

test("session upload enforces origin, known session, image type and bounded body before writing", async ({
  dashboard,
}) => {
  const { sessionId } = await launched(dashboard);
  const url = attachmentUrl(dashboard, sessionId);
  const requests = [
    { url, method: "GET", status: 405, error: "Only POST is accepted." },
    {
      url,
      origin: "https://other.example",
      method: "GET",
      status: 403,
      error: "This endpoint refuses cross-origin requests.",
    },
    {
      url,
      origin: "https://other.example",
      status: 403,
      error: "This endpoint refuses cross-origin requests.",
    },
    {
      url: attachmentUrl(dashboard, "missing"),
      status: 404,
      error: "This dashboard launched no such session for this project.",
    },
    {
      url,
      type: "application/pdf",
      body: "not an image",
      status: 415,
      error: launchAttachmentUnsupportedType,
    },
    { url, status: 400, error: launchAttachmentEmpty },
    {
      url,
      body: "x".repeat(12 * 1024 * 1024),
      status: 413,
      error: launchAttachmentTooLarge,
    },
  ];
  for (const { url, origin, method, type, body, status, error } of requests) {
    const response = await rawRequest({
      url,
      method: method ?? "POST",
      headers: {
        Origin: origin ?? dashboard.origin,
        "Content-Type": type ?? "image/png",
        "Content-Length": String(body?.length ?? 0),
      },
      ...(body === undefined ? {} : { body }),
    });
    expect(response.status).toBe(status);
    expect(JSON.parse(response.body)).toEqual({ error });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(existsSync(attachmentsRoot(dashboard))).toBe(false);
  }
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("an unavailable native session cannot store a pasted image", async ({
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  native.observations.set(native.threadId, {
    status: { type: "idle" },
    turns: [],
    metadataError: {
      code: -32600,
      message: `thread not loaded: ${native.threadId}`,
    },
  });
  const response = await rawRequest({
    url: attachmentUrl(dashboard, native.threadId, "codex"),
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "image/png" },
    body: "image bytes",
  });
  expect(response.status).toBe(410);
  expect(JSON.parse(response.body)).toEqual({
    error: "This conversation is no longer available in Codex.",
  });
  expect(existsSync(attachmentsRoot(dashboard))).toBe(false);
});

test("successful requests keep numbered images and a storage refusal keeps the existing file", async ({
  dashboard,
}) => {
  const { sessionId } = await launched(dashboard);
  const url = attachmentUrl(dashboard, sessionId);
  const upload = (image: Buffer, name: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        Origin: dashboard.origin,
        "Content-Type": "image/png",
        [launchAttachmentNameHeader]: name,
      },
      body: new Uint8Array(image),
    });
  const directory = path.join(attachmentsRoot(dashboard), "claude", sessionId);
  for (const [index, image] of [pngA, pngB].entries()) {
    const response = await upload(image, "../pasted.png");
    expect(response.status).toBe(200);
    const stored = path.join(directory, `${String(index + 1)}-pasted.png`);
    expect(await response.json()).toEqual({ path: stored });
    expect(readFileSync(stored)).toEqual(image);
  }
  const concurrent = await Promise.all([
    upload(pngA, "front.png"),
    upload(pngB, "back.png"),
  ]);
  for (const [index, response] of concurrent.entries()) {
    expect(response.status).toBe(200);
    const stored = (await response.json()) as { path: string };
    expect(readFileSync(stored.path)).toEqual(index === 0 ? pngA : pngB);
  }
  const files = listedMachineDirs(directory);
  expect(files.map((name) => name.split("-")[0])).toEqual(["1", "2", "3", "4"]);

  const blockingRecord = path.join(
    attachmentsRoot(dashboard),
    "claude",
    (await launched(dashboard)).sessionId,
  );
  writeFileSync(blockingRecord, "keep this existing file");
  const refused = await fetch(
    attachmentUrl(dashboard, path.basename(blockingRecord)),
    {
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "image/png" },
      body: new Uint8Array(pngA),
    },
  );
  expect(refused.status).toBe(503);
  expect(await refused.json()).toEqual({
    error: "The image could not be stored.",
  });
  expect(readFileSync(blockingRecord, "utf8")).toBe("keep this existing file");
  expect(readFileSync(path.join(directory, "1-pasted.png"))).toEqual(pngA);
});

test("an opaque host session ID cannot select a storage path component", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  native.threadId = "../another/session";
  await launch(dashboard, { ...refinementRequest, host: "codex" });
  const response = await fetch(
    attachmentUrl(dashboard, native.threadId, "codex"),
    {
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "image/png" },
      body: new Uint8Array(pngA),
    },
  );
  expect(response.status).toBe(200);
  const key = createHash("sha256").update(native.threadId).digest("hex");
  const stored = path.join(
    attachmentsRoot(dashboard),
    "codex",
    `~${key}`,
    "1-image.png",
  );
  expect(await response.json()).toEqual({ path: stored });
  expect(readFileSync(stored)).toEqual(pngA);
});
