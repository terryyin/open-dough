// Attachment boundary refusals: unsupported type, oversized body and too many
// claims write no claim or attempt folder and start nothing. A launch the
// boundary refuses after claims are posted also leaves no attempt folder.

import { mkdtempSync, rmSync } from "node:fs";
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
  recordedRequestWithMaterializedAttachments,
} from "../../server/launchAttachmentClaims.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  launchAttachmentClaimsRoot,
  launchAttachmentsRoot,
  listedMachineDirs,
  pngA,
} from "../support/launchAttachmentFixtures.ts";

function withTempHome(prefix: string, run: (home: string) => void): void {
  const previousHome = process.env["HOME"];
  const home = mkdtempSync(path.join(tmpdir(), prefix));
  process.env["HOME"] = home;
  try {
    run(home);
  } finally {
    if (previousHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previousHome;
    rmSync(home, { recursive: true, force: true });
  }
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
    expect(listedMachineDirs(launchAttachmentClaimsRoot(server.home))).toEqual(
      [],
    );
    expect(listedMachineDirs(launchAttachmentsRoot(server.home))).toEqual([]);
    expect(server.claudeLaunchCalls()).toEqual([]);
  } finally {
    await server.close();
  }
});

test("materialize refuses a sixth claim without writing an attempt folder", () => {
  withTempHome("dough-launch-attach-", (home) => {
    const claims = [...Array(6).keys()].map((index) =>
      claimLaunchAttachment(pngA, "image/png", `n${String(index)}.png`),
    );
    expect(listedMachineDirs(launchAttachmentClaimsRoot(home))).toHaveLength(6);
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
    expect(listedMachineDirs(launchAttachmentsRoot(home))).toEqual([]);
    expect(listedMachineDirs(launchAttachmentClaimsRoot(home))).toEqual([]);
  });
});

test("a refused launch abandons claims and writes no attachment folder", () => {
  withTempHome("dough-launch-attach-refuse-", (home) => {
    const claim = claimLaunchAttachment(pngA, "image/png", "card.png");
    expect(listedMachineDirs(launchAttachmentClaimsRoot(home))).toEqual([
      claim,
    ]);
    // Wire paths are recorded only after admission; naming them on the request
    // is refused and abandons the claims without creating an attempt folder.
    try {
      recordedRequestWithMaterializedAttachments("attempt-refused", {
        source: "open-dough",
        workflow: "ad-hoc",
        host: "claude",
        instruction: "Why is this card clipped?",
        attachments: ["/tmp/not-allowed.png"],
        attachmentClaims: [claim],
      });
      expect(false, "expected refusal").toBe(true);
    } catch (error) {
      expect(error).toBeInstanceOf(RefusedRequest);
      expect(error).toMatchObject({
        status: 400,
        message: "The launch request is malformed.",
      });
    }
    expect(listedMachineDirs(launchAttachmentsRoot(home))).toEqual([]);
    expect(listedMachineDirs(launchAttachmentClaimsRoot(home))).toEqual([]);
  });
});
