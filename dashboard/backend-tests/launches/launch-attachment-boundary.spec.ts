import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
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

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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
  const dashboardDirectory = mkdtempSync(
    path.join(tmpdir(), "dough-launch-attach-"),
  );
  onTestFinished(() => {
    rmSync(dashboardDirectory, { recursive: true, force: true });
  });
  const claimsDirectory = path.join(
    dashboardDirectory,
    "launch-attachment-claims",
  );
  const attemptsDirectory = path.join(dashboardDirectory, "launch-attachments");
  const claims = [...Array(6).keys()].map((index) =>
    claimLaunchAttachment(
      png,
      "image/png",
      `n${String(index)}.png`,
      dashboardDirectory,
    ),
  );

  for (const claim of claims) {
    expect(readFileSync(path.join(claimsDirectory, claim, "bytes"))).toEqual(
      png,
    );
  }
  expect(() =>
    materializeLaunchAttachments(
      "attempt-too-many",
      claims,
      dashboardDirectory,
    ),
  ).toThrow(
    expect.objectContaining({
      constructor: RefusedRequest,
      status: 400,
      message: launchAttachmentTooMany,
    }),
  );
  expect(
    existsSync(attemptsDirectory) ? readdirSync(attemptsDirectory) : [],
  ).toEqual([]);
  expect(readdirSync(claimsDirectory)).toEqual([]);
});

test("a refused launch abandons claims and writes no attachment folder", () => {
  const dashboardDirectory = mkdtempSync(
    path.join(tmpdir(), "dough-launch-attach-refuse-"),
  );
  onTestFinished(() => {
    rmSync(dashboardDirectory, { recursive: true, force: true });
  });
  const claimsDirectory = path.join(
    dashboardDirectory,
    "launch-attachment-claims",
  );
  const attemptsDirectory = path.join(dashboardDirectory, "launch-attachments");
  const claim = claimLaunchAttachment(
    png,
    "image/png",
    "card.png",
    dashboardDirectory,
  );
  expect(readFileSync(path.join(claimsDirectory, claim, "bytes"))).toEqual(png);
  const request = makeMe.aLaunchRequest
    .adHoc({ attachmentClaims: [claim] })
    .please();

  expect(() =>
    recordedRequestWithMaterializedAttachments(
      "attempt-refused",
      { ...request, attachments: ["/tmp/not-allowed.png"] },
      dashboardDirectory,
    ),
  ).toThrow(
    expect.objectContaining({
      constructor: RefusedRequest,
      status: 400,
      message: "The launch request is malformed.",
    }),
  );
  expect(
    existsSync(attemptsDirectory) ? readdirSync(attemptsDirectory) : [],
  ).toEqual([]);
  expect(readdirSync(claimsDirectory)).toEqual([]);
});
