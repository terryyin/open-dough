// Attachment boundary refusals: unsupported type, oversized body and too many
// claims write no claim or attempt folder and start nothing.

import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { rawRequest } from "../support/rawHttp.ts";
import {
  launchAttachmentEndpoint,
  launchAttachmentLimitBytes,
  launchAttachmentNameHeader,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentUnsupportedType,
} from "../../src/launchAttachments.ts";
import {
  claimLaunchAttachment,
  materializeLaunchAttachments,
} from "../../server/launchAttachmentClaims.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { pngA } from "../support/launchAttachmentFixtures.ts";

function claimsRoot(home: string): string {
  return path.join(
    home,
    ".open-dough",
    "dashboard",
    "launch-attachment-claims",
  );
}

function attachmentsRoot(home: string): string {
  return path.join(home, ".open-dough", "dashboard", "launch-attachments");
}

function listed(directory: string): string[] {
  return existsSync(directory) ? readdirSync(directory).sort() : [];
}

test("the attachment boundary refuses a PDF and an oversized PNG without writing a claim", async () => {
  const server = await startDashboardServer({ mode: "boundary" });
  const url = new URL(launchAttachmentEndpoint, server.baseURL).href;
  const origin = new URL(server.baseURL).origin;
  try {
    for (const request of [
      {
        headers: {
          Origin: origin,
          "Content-Type": "application/pdf",
          [launchAttachmentNameHeader]: "notes.pdf",
        },
        body: "%PDF-1.4",
        status: 415,
        error: launchAttachmentUnsupportedType,
      },
      {
        headers: {
          Origin: origin,
          "Content-Type": "image/png",
          [launchAttachmentNameHeader]: "huge.png",
          "Content-Length": String(launchAttachmentLimitBytes + 1),
        },
        status: 413,
        error: launchAttachmentTooLarge,
      },
    ]) {
      const response = await rawRequest({
        url,
        method: "POST",
        headers: request.headers,
        ...(request.body === undefined ? {} : { body: request.body }),
      });
      expect(response.status).toBe(request.status);
      expect(JSON.parse(response.body)).toEqual({ error: request.error });
      expect(response.headers["cache-control"]).toBe("no-store");
    }
    expect(listed(claimsRoot(server.home))).toEqual([]);
    expect(listed(attachmentsRoot(server.home))).toEqual([]);
    expect(server.claudeLaunchCalls()).toEqual([]);
  } finally {
    await server.close();
  }
});

test("materialize refuses a sixth claim without writing an attempt folder", () => {
  const previousHome = process.env["HOME"];
  const home = mkdtempSync(path.join(tmpdir(), "dough-launch-attach-"));
  process.env["HOME"] = home;
  try {
    const claims = [...Array(6).keys()].map((index) =>
      claimLaunchAttachment(pngA, "image/png", `n${String(index)}.png`),
    );
    expect(listed(claimsRoot(home))).toHaveLength(6);
    const attemptId = "attempt-too-many";
    try {
      materializeLaunchAttachments(attemptId, claims);
      expect(false, "expected materialize to refuse").toBe(true);
    } catch (error) {
      expect(error).toBeInstanceOf(RefusedRequest);
      expect(error).toMatchObject({
        status: 400,
        message: launchAttachmentTooMany,
      });
    }
    expect(listed(attachmentsRoot(home))).toEqual([]);
    expect(listed(claimsRoot(home))).toEqual([]);
  } finally {
    if (previousHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previousHome;
    rmSync(home, { recursive: true, force: true });
  }
});
