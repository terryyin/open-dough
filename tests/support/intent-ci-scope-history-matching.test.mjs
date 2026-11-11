import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";

test("folder history uses each build's published descendants while excluding sibling prefixes and preserving file zero", () => {
  const observations = [
    {
      case: [
        ["tests/folder/a.spec.ts", 100],
        ["tests/folder/nested/c.spec.ts", 200],
        ["tests/root.spec.ts", 400],
        ["tests/folder-other/a.spec.ts", 9000],
      ],
      file: [
        ["tests/folder/a.spec.ts", 10],
        ["tests/folder/nested/c.spec.ts", 20],
        ["tests/root.spec.ts", 40],
        ["tests/folder-other/a.spec.ts", 900],
      ],
    },
    {
      case: [
        ["tests/folder/a.spec.ts", 0],
        ["tests/folder/nested/c.spec.ts", 400],
        ["tests/folder/ghost.spec.ts", 500],
        ["tests/root.spec.ts", 600],
        ["tests/folder-other/a.spec.ts", 99000],
      ],
      file: [
        ["tests/folder/a.spec.ts", 0],
        ["tests/folder/nested/c.spec.ts", 40],
        ["tests/folder/ghost.spec.ts", 50],
        ["tests/root.spec.ts", 60],
        ["tests/folder-other/a.spec.ts", 9900],
      ],
    },
  ];
  const history = makeMe.aLandedCiHistory;
  const landings = observations.map((files, index) => {
    const runId = index + 1;
    const revision = runId.toString(16).repeat(40);
    const landing = makeMe.aLaunchLanding
      .comparing({ base: index.toString(16).repeat(40), revision })
      .deliveredAs({
        delivery: `membership-${runId}`,
        receipt: `membership-${runId}`,
      })
      .receivedAt(`2026-11-0${runId}T00:00:00Z`)
      .please();
    history.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision, runId })
            .entries([
              makeMe.aCiProofEntry
                .at("tests")
                .holding(
                  ...["case", "file"].map((unit) =>
                    makeMe.aCiProofEvidence
                      .inUnit(unit)
                      .brokenDown(
                        ...files[unit].map(([path, durationMs]) => ({
                          path,
                          passed: 1,
                          durationMs,
                        })),
                      )
                      .please(),
                  ),
                )
                .please(),
            ])
            .please(),
        })
        .please(),
    );
    return landing;
  });
  const selected = landings[1];
  const order = landings.map(({ revision }) => revision);
  const endpoint = { revision: selected.revision, at: selected.receivedAt };
  const retained = history.please();
  const folder = scopeHistoryOf(retained, "tests/folder", endpoint, order);
  assert.deepEqual(
    folder.entries.map(({ readings }) =>
      readings.map(({ unit, ms, segment }) => ({ unit, ms, segment })),
    ),
    [
      [
        { unit: "case", ms: 300, segment: "1" },
        { unit: "file", ms: 30, segment: "1" },
      ],
      [
        { unit: "case", ms: 900, segment: "1" },
        { unit: "file", ms: 90, segment: "1" },
      ],
    ],
  );
  const file = scopeHistoryOf(
    retained,
    "tests/folder/a.spec.ts",
    endpoint,
    order,
  );
  assert.deepEqual(
    file.entries.map(({ readings }) => readings.map(({ ms }) => ms)),
    [
      [100, 10],
      [0, 0],
    ],
  );
  assert.equal(folder.entries[1].selected, true);
  assert.equal(file.entries[1].kind, "point");
  assert.equal(file.entries[1].selected, true);
});

test("a longer owner's former-path evidence cannot borrow a matching parent file and supported earlier segments survive an expired endpoint", () => {
  const path = "tests/folder/current.spec.ts";
  const entries = [
    [
      makeMe.aCiProofEntry
        .at("tests")
        .brokenDownBy([
          { path, passed: 1, failed: 0, other: 0, durationMs: 10 },
        ])
        .please(),
    ],
    [
      makeMe.aCiProofEntry
        .at("tests")
        .brokenDownBy([
          { path, passed: 1, failed: 0, other: 0, durationMs: 9999 },
        ])
        .please(),
      makeMe.aCiProofEntry
        .at("tests/folder")
        .brokenDownBy([
          {
            path: "tests/folder/former.spec.ts",
            passed: 1,
            failed: 0,
            other: 0,
            durationMs: 20,
          },
        ])
        .please(),
    ],
    [
      makeMe.aCiProofEntry
        .at("tests")
        .brokenDownBy([
          { path, passed: 1, failed: 0, other: 0, durationMs: 30 },
        ])
        .please(),
    ],
  ];
  const history = makeMe.aLandedCiHistory;
  const landings = [1, 2, 3, 4].map((runId) => {
    const revision = runId.toString(16).repeat(40);
    const landing = makeMe.aLaunchLanding
      .comparing({ base: (runId - 1).toString(16).repeat(40), revision })
      .deliveredAs({ delivery: `path-${runId}`, receipt: `path-${runId}` })
      .receivedAt(`2026-11-0${runId}T00:00:00Z`)
      .please();
    history.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          state: "pass",
          proof:
            runId === 4
              ? { kind: "unavailable", reason: "expired" }
              : makeMe.aCiProof
                  .forRun({ revision, runId })
                  .entries(entries[runId - 1])
                  .please(),
        })
        .please(),
    );
    return landing;
  });
  const selected = landings[3];
  const answer = scopeHistoryOf(
    history.please(),
    path,
    { revision: selected.revision, at: selected.receivedAt },
    landings.map(({ revision }) => revision),
  );
  assert.deepEqual(
    answer.entries.map(({ kind }) => kind),
    ["point", "gap", "point", "gap"],
  );
  assert.deepEqual(answer.entries[0].readings[0], {
    kind: "point",
    unit: "case",
    ms: 10,
    entry: "tests",
    segment: "1",
  });
  assert.match(answer.entries[1].readings[0].reason, /No matching scope/);
  assert.equal("ms" in answer.entries[1].readings[0], false);
  assert.deepEqual(answer.entries[2].readings[0], {
    kind: "point",
    unit: "case",
    ms: 30,
    entry: "tests",
    segment: "2",
  });
  assert.match(answer.entries[3].readings[0].reason, /Expired CI proof/);
  assert.equal("ms" in answer.entries[3].readings[0], false);
  assert.equal(answer.entries[3].selected, true);
});
