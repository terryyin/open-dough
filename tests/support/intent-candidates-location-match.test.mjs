import assert from "node:assert/strict";
import { test } from "node:test";
import {
  matchRecordedLocationReference,
  splitPathAndCase,
} from "../../dashboard/src/intentCandidatesLocationMatch.ts";
import { segmentLocationReferences } from "../../dashboard/src/intentCandidatesLocationSegments.ts";

const recordPath = ".planning/TEST-OPTIMIZATION-CANDIDATES.md";

const inventory = {
  locationRoots: ["dashboard/tests", "tests"],
  files: [
    "dashboard/tests/agent-launch-second-server.spec.ts",
    "dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts",
    "dashboard/tests/story-review-completed.spec.ts",
    "dashboard/tests/boundary/story-review-completed.spec.ts",
    "dashboard/tests/intent-gherkin-browse.spec.ts",
    "tests/compare-versions.sh",
  ],
};

const match = (recorded) =>
  matchRecordedLocationReference(recorded, recordPath, inventory);

test("splitPathAndCase keeps path::name and path:line case targets", () => {
  assert.deepEqual(splitPathAndCase("tests/test_clip_core.py::test_h264"), {
    path: "tests/test_clip_core.py",
    caseTarget: "test_h264",
  });
  assert.deepEqual(splitPathAndCase("src/agentLaunches.ts:176"), {
    path: "src/agentLaunches.ts",
    caseTarget: "176",
  });
  assert.deepEqual(splitPathAndCase("dashboard/tests/foo.spec.ts"), {
    path: "dashboard/tests/foo.spec.ts",
  });
});

test("backticked full path matching one configured file opens that file", () => {
  assert.deepEqual(
    match("dashboard/tests/agent-launch-second-server.spec.ts"),
    {
      kind: "file",
      path: "dashboard/tests/agent-launch-second-server.spec.ts",
    },
  );
});

test("bare unique filename opens the only configured match", () => {
  assert.deepEqual(match("intent-gherkin-browse.spec.ts"), {
    kind: "file",
    path: "dashboard/tests/intent-gherkin-browse.spec.ts",
  });
});

test("bare ambiguous filename lists every full path and opens none", () => {
  assert.deepEqual(match("story-review-completed.spec.ts"), {
    kind: "several",
    paths: [
      "dashboard/tests/boundary/story-review-completed.spec.ts",
      "dashboard/tests/story-review-completed.spec.ts",
    ],
  });
});

test("Markdown link relative to .planning/ resolves beside the record", () => {
  assert.deepEqual(
    match("../dashboard/tests/agent-launch-second-server.spec.ts"),
    {
      kind: "file",
      path: "dashboard/tests/agent-launch-second-server.spec.ts",
    },
  );
});

test("glob, symbol, sha:path, and prose are not file references", () => {
  for (const recorded of [
    "**/*.py",
    "checkIntervalMs",
    "40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md",
    "browser file isolation with no path",
  ]) {
    assert.deepEqual(match(recorded), { kind: "not-a-file-reference" });
  }
});

test("full path under a configured root but missing from files is not published", () => {
  assert.deepEqual(match("dashboard/tests/moved-away-after-record.spec.ts"), {
    kind: "not-published",
    path: "dashboard/tests/moved-away-after-record.spec.ts",
  });
});

test("full path outside configured roots is outside configured locations", () => {
  const frontendOnly = {
    locationRoots: ["frontend/src"],
    files: ["frontend/src/devices.spec.ts"],
  };
  assert.deepEqual(
    matchRecordedLocationReference(
      "tests/test_clip_core.py::test_clip_segments_h264_reencodes_video",
      recordPath,
      frontendOnly,
    ),
    {
      kind: "outside-configured",
      path: "tests/test_clip_core.py",
      caseTarget: "test_clip_segments_h264_reencodes_video",
    },
  );
});

test("full path under a configured root with the file absent is not published even when another root exists", () => {
  assert.deepEqual(
    matchRecordedLocationReference("tests/test_clip_core.py", recordPath, {
      locationRoots: ["dashboard/tests", "tests"],
      files: inventory.files,
    }),
    {
      kind: "not-published",
      path: "tests/test_clip_core.py",
    },
  );
});

test("segmentLocationReferences keeps prose plain and matches backtick and Markdown spans", () => {
  const text =
    "`story-review-completed.spec.ts` trailing radio and [second server](../dashboard/tests/agent-launch-second-server.spec.ts) plus `**/*.py` and `40e1d2f9:path/to/PLAN.md`";
  const segments = segmentLocationReferences(text, recordPath, inventory);
  assert.equal(segments[0].kind, "reference");
  assert.equal(segments[0].match.kind, "several");
  assert.equal(segments[1].kind, "text");
  assert.match(segments[1].text, /trailing radio/);
  const link = segments.find(
    (segment) =>
      segment.kind === "reference" && segment.label === "second server",
  );
  assert.deepEqual(link?.match, {
    kind: "file",
    path: "dashboard/tests/agent-launch-second-server.spec.ts",
  });
  const glob = segments.find(
    (segment) => segment.kind === "reference" && segment.recorded === "**/*.py",
  );
  assert.deepEqual(glob?.match, { kind: "not-a-file-reference" });
  const sha = segments.find(
    (segment) =>
      segment.kind === "reference" &&
      segment.recorded === "40e1d2f9:path/to/PLAN.md",
  );
  assert.deepEqual(sha?.match, { kind: "not-a-file-reference" });
});
