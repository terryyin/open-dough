// Intent's one reader of a published Test Optimization Candidates record
// (dashboard/src/testOptimizationCandidates.ts) reads the live record and the
// earlier four-section record, and calls any other shape mismatched.

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTestOptimizationCandidates } from "../../../dashboard/src/testOptimizationCandidates.ts";
import { makeMe } from "./makeMe.mjs";

const title = "# Test Optimization Candidates\n";

const rateLimitCandidate = {
  slug: "rate-limit-real-waits",
  locations: "`dashboard/tests/observation/auto-refresh-rate-limit.spec.ts`",
  observedCost:
    "25.2s in hosted run 42372706379; 21.7s locally, 2 workers, load 4–6",
  uniqueProtection: "no read before GitHub's directed time",
  alternativesTried: "the page clock is already paused and stepped",
  decisionOrEvidenceNeeded:
    "whether the request owner may take a test-controlled clock",
};

const liveRecord = () =>
  makeMe.aTestOptimizationCandidatesRecord
    .live()
    .candidate(rateLimitCandidate.slug, rateLimitCandidate.locations, {
      observedCost: rateLimitCandidate.observedCost,
      uniqueProtection: rateLimitCandidate.uniqueProtection,
      alternativesTried: rateLimitCandidate.alternativesTried,
      decisionOrEvidenceNeeded: rateLimitCandidate.decisionOrEvidenceNeeded,
    })
    .candidate("pinned-build-start", "`dashboard/tests/runtime/build.spec.ts`")
    .please();

test("a live record reads each candidate's five facts", () => {
  const parsed = parseTestOptimizationCandidates(liveRecord());
  assert.equal(parsed.status, "record");
  assert.equal(parsed.empty, false);
  assert.equal(parsed.record.version, "live");
  assert.equal(parsed.record.live.kind, "entries");
  assert.deepEqual(
    parsed.record.live.entries.map(({ slug }) => slug),
    ["rate-limit-real-waits", "pinned-build-start"],
  );
  assert.deepEqual(parsed.record.live.entries[0], rateLimitCandidate);
});

test("a live record holding None. has no live candidates", () => {
  assert.deepEqual(
    parseTestOptimizationCandidates(
      makeMe.aTestOptimizationCandidatesRecord.live().please(),
    ),
    {
      status: "record",
      empty: true,
      record: { version: "live", live: { kind: "none" } },
    },
  );
});

test("a four-section record reads with a leading pass summary and the note naming its profile-only mechanism", () => {
  const note =
    "Existing mechanism: `@skipOptimizationDueToKnownNecessarySlowness` on a\nScenario or Feature. Normal verification and CI still run them.";
  const record = makeMe.aTestOptimizationCandidatesRecord
    .pending("e2e-batch-cold-start", "`cli_notebook_lfs.feature` cold start")
    .profileOnly("bazaar-subscription-journey", "`bazaar_subscription.feature`")
    .profileOnlyMechanism(note)
    .please()
    .replace(
      title,
      `${title}\n## Latest pass\n\n- **Command / scope:** planned execution of two candidates.\n- **Outcome:** measured gain — focused command only.\n`,
    );

  const parsed = parseTestOptimizationCandidates(record);
  assert.equal(parsed.status, "record");
  assert.equal(parsed.empty, false);
  assert.equal(parsed.record.version, "four-section");
  const { pending, accepted, profileOnly, transferred } = parsed.record;
  assert.deepEqual(
    pending.kind === "entries" && pending.entries.map(({ slug }) => slug),
    ["e2e-batch-cold-start"],
  );
  assert.deepEqual(accepted, { kind: "none" });
  assert.equal(profileOnly.kind === "entries" && profileOnly.note, note);
  assert.deepEqual(
    profileOnly.kind === "entries" &&
      profileOnly.entries.map(({ slug }) => slug),
    ["bazaar-subscription-journey"],
  );
  assert.deepEqual(transferred, { kind: "none" });
});

test("a record of neither version is mismatched, with no partial guess", () => {
  const fourSection = makeMe.aTestOptimizationCandidatesRecord
    .pending("launch-waits", "`dashboard/tests/a.spec.ts`")
    .profileOnly("tagged-journey", "`dashboard/tests/b.spec.ts`")
    .profileOnlyMechanism("Existing mechanism: a profile-only tag.")
    .please();
  assert.equal(parseTestOptimizationCandidates(fourSection).status, "record");
  assert.equal(parseTestOptimizationCandidates(liveRecord()).status, "record");
  for (const [shape, text] of [
    [
      "a live record keeping a four-section section",
      `${liveRecord()}\n## Transferred obligations\n\nNone.\n`,
    ],
    [
      "a leading pass summary before Live candidates",
      liveRecord().replace(title, `${title}\n## Latest pass\n\nMeasured.\n`),
    ],
    [
      "a live candidate under a four-section label",
      liveRecord().replace(
        "- **Alternatives tried:** the page clock",
        "- **Alternatives attempted:** the page clock",
      ),
    ],
    [
      "a live candidate missing its decision or evidence needed",
      liveRecord().replace(
        "- **Decision or evidence needed:** whether the request owner may take a test-controlled clock\n",
        "",
      ),
    ],
    [
      "a note opening the live section",
      liveRecord().replace(
        "## Live candidates\n",
        "## Live candidates\n\nExisting mechanism: a profile-only tag.\n",
      ),
    ],
    [
      "a note opening a section other than Profile-only exclusions",
      fourSection.replace(
        "## Pending candidates\n",
        "## Pending candidates\n\nExisting mechanism: a profile-only tag.\n",
      ),
    ],
    [
      "a four-section entry with a field of neither version",
      fourSection.replace(
        "- **Evidence / follow-up:** profile\n",
        "- **Evidence / follow-up:** profile\n- **Repository baseline:** two workers\n",
      ),
    ],
  ]) {
    assert.notEqual(text, liveRecord(), shape);
    assert.notEqual(text, fourSection, shape);
    assert.deepEqual(
      parseTestOptimizationCandidates(text),
      { status: "mismatched" },
      shape,
    );
  }
});
