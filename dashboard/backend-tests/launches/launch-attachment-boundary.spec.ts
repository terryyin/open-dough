import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { expect, test } from "vitest";
import {
  launchAttachmentLimitBytes,
  launchAttachmentNameHeader,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentUnsupportedType,
} from "../../src/launchAttachments.ts";
import { answerLaunchAttachmentUpload } from "../../server/launchAttachmentBoundary.ts";
import {
  claimLaunchAttachment,
  materializeLaunchAttachments,
  recordedRequestWithMaterializedAttachments,
} from "../../server/launchAttachmentClaims.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { machineDashboardDirectory } from "../../server/machineHome.ts";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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

test.each([
  {
    label: "a PDF",
    headers: {
      "content-type": "application/pdf",
      [launchAttachmentNameHeader]: "notes.pdf",
    },
    bytes: Buffer.from("%PDF-1.4"),
    status: 415,
    error: launchAttachmentUnsupportedType,
  },
  {
    label: "a PNG declared over the size limit",
    headers: {
      "content-type": "image/png",
      [launchAttachmentNameHeader]: "huge.png",
      "content-length": String(launchAttachmentLimitBytes + 1),
    },
    bytes: png,
    status: 413,
    error: launchAttachmentTooLarge,
  },
])(
  "upload admission refuses $label before writing a claim",
  async ({ headers, bytes, status, error }) => {
    const dashboardDirectory = mkdtempSync(
      path.join(tmpdir(), "dough-launch-upload-"),
    );
    const request = Object.assign(new PassThrough(), { headers });
    try {
      request.end(bytes);
      const answer = await answerLaunchAttachmentUpload(
        request,
        new AbortController().signal,
        dashboardDirectory,
      );
      expect(answer).toEqual({
        status,
        body: { error },
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
      expect(request.readableDidRead).toBe(false);
      expect(readdirSync(dashboardDirectory)).toEqual([]);
    } finally {
      request.destroy();
      rmSync(dashboardDirectory, { recursive: true, force: true });
    }
  },
);

test("materialize refuses a sixth claim without writing an attempt folder", () => {
  withTempHome("dough-launch-attach-", (home) => {
    const dashboard = machineDashboardDirectory(home);
    const claimsDirectory = path.join(dashboard, "launch-attachment-claims");
    const attemptsDirectory = path.join(dashboard, "launch-attachments");
    const claims = [...Array(6).keys()].map((index) =>
      claimLaunchAttachment(png, "image/png", `n${String(index)}.png`),
    );
    expect(readdirSync(claimsDirectory)).toHaveLength(6);
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
    expect(
      existsSync(attemptsDirectory) ? readdirSync(attemptsDirectory) : [],
    ).toEqual([]);
    expect(readdirSync(claimsDirectory)).toEqual([]);
  });
});

test("a refused launch abandons claims and writes no attachment folder", () => {
  withTempHome("dough-launch-attach-refuse-", (home) => {
    const dashboard = machineDashboardDirectory(home);
    const claimsDirectory = path.join(dashboard, "launch-attachment-claims");
    const attemptsDirectory = path.join(dashboard, "launch-attachments");
    const claim = claimLaunchAttachment(png, "image/png", "card.png");
    expect(readdirSync(claimsDirectory)).toEqual([claim]);
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
    expect(
      existsSync(attemptsDirectory) ? readdirSync(attemptsDirectory) : [],
    ).toEqual([]);
    expect(readdirSync(claimsDirectory)).toEqual([]);
  });
});
