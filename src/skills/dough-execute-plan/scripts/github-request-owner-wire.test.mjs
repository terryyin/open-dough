// An archive's bytes, such as an Actions artifact's zip, survive one
// `gh api --include` answer and the owner's JSON wire exactly, as base64;
// every other answer reads as the text `gh` printed.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readAnswer } from "./github-request-answer.mjs";
import {
  answerFromWire,
  printedAnswer,
  wireAnswer,
  fixedRequest,
  fixedOperation,
} from "./github-request-owner-wire.mjs";

const askedAt = "2026-01-01T00:00:00.000Z";

function printed(contentType, body) {
  return Buffer.concat([
    Buffer.from(`HTTP/1.1 200 OK\nContent-Type: ${contentType}\r\n\r\n`),
    body,
  ]);
}

// Bytes no UTF-8 reading keeps: a lone continuation byte, an invalid lead
// byte, a NUL and a line feed.
const bytes = Buffer.from([
  0x50, 0x4b, 0x03, 0x04, 0x80, 0xff, 0x00, 0x0a, 0xc3,
]);

test("an archive answer keeps its exact bytes as base64 across the owner's wire", () => {
  const answer = printedAnswer(
    null,
    printed("application/zip", bytes),
    Buffer.alloc(0),
    askedAt,
  );
  assert.equal(answer.status, 200);
  assert.equal(answer.bodyEncoding, "base64");
  const told = answerFromWire(JSON.parse(JSON.stringify(wireAnswer(answer))));
  assert.equal(told.bodyEncoding, "base64");
  assert.deepEqual(Buffer.from(told.body, "base64"), bytes);
});

test("a text answer reads exactly as readAnswer reads what gh printed, and says no encoding", () => {
  const stdout = printed(
    "application/json; charset=utf-8",
    Buffer.from('{"a":"é"}'),
  );
  const answer = printedAnswer(null, stdout, Buffer.alloc(0), askedAt);
  assert.deepEqual(
    answer,
    readAnswer(null, stdout.toString("utf8"), "", askedAt),
  );
  assert.equal(answerFromWire(wireAnswer(answer)).bodyEncoding, undefined);
});

test("a failed archive answer is read as gh printed it, without bytes", () => {
  const answer = printedAnswer(
    { code: 1 },
    printed("application/zip", bytes),
    Buffer.from("gh: Not Found (HTTP 404)\n"),
    askedAt,
  );
  assert.deepEqual(answer.failure, { kind: "http", status: 404 });
  assert.equal(answer.bodyEncoding, undefined);
});

test("the action wire constructs only one full-rerun POST while the generic request stays read-only", () => {
  const bounds = {
    scope: "fixture-scope",
    boundMs: 1_000,
    maxBufferBytes: 1024,
  };
  const action = {
    ...bounds,
    operation: "rerun-workflow",
    repository: "owner/repo",
    runId: 71,
  };
  const args = [
    "api",
    "--method",
    "POST",
    "repos/owner/repo/actions/runs/71/rerun",
  ];
  assert.deepEqual(fixedOperation(action), {
    ...bounds,
    operation: "rerun-workflow",
    args,
  });
  assert.equal(fixedRequest(action), undefined);
  assert.equal(fixedRequest({ ...bounds, args }), undefined);
  assert.deepEqual(
    fixedRequest({
      ...bounds,
      args: ["api", "repos/owner/repo/actions/runs/71"],
    }),
    {
      ...bounds,
      args: ["api", "repos/owner/repo/actions/runs/71"],
    },
  );
  for (const forbidden of [
    { ...action, operation: "rerun-failed-jobs" },
    { ...action, operation: "dispatch" },
    { ...action, args: ["api", "other/route"] },
    { ...action, repository: "owner/repo/elsewhere" },
    { ...action, repository: "owner/.." },
    { ...action, repository: "../repo" },
    { ...action, runId: -1 },
    { ...action, boundMs: 0 },
  ])
    assert.equal(fixedOperation(forbidden), undefined);
});
