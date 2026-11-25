// Exact Done publication boundaries traverse the authenticated local reader.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import {
  keepLandedCiHistory,
  minutesAgo,
} from "../../test-support/support/landedCiHistory.ts";

const source = makeMe.aPublishedSource.openDough.please();
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("a Done read uses its exact publication, excludes its shared equivalent attempt and a cancelled future proxy, and keeps a later selected measurement", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-done-wall-reference-"));
  const names = [
    "prior1",
    "prior2",
    "prior3",
    "prior4",
    "prior5",
    "shared",
    "cancelled",
    "execution",
    "unrelated",
    "publication",
  ];
  const revisionOf = (title: string) => {
    const index = names.indexOf(title);
    if (index < 0) throw new Error(`No change ${title}.`);
    return (index + 1).toString(16).padStart(40, "0");
  };
  const landings = names.map((title, index) => {
    const minutes = names.length - index;
    return {
      title,
      revision: revisionOf(title),
      receipt: `bbbbbbbb-0000-4000-8000-0000000000${String(minutes).padStart(2, "0")}`,
      at: minutesAgo(minutes),
    };
  });
  const landing = (title: string) => {
    const found = landings.find((each) => each.title === title);
    if (found === undefined) throw new Error(`No landing ${title}.`);
    return found;
  };
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(
    landings.map(({ revision }) => revision),
  );
  for (const [index, title] of names.entries()) {
    const facts = landing(title);
    const selected = title === "execution" || title === "shared";
    const future = title === "cancelled";
    const runId = selected ? 6 : future ? 10 : index + 1;
    const revision = revisionOf(
      selected ? "shared" : future ? "publication" : title,
    );
    const start = `2026-11-${String(runId).padStart(2, "0")}T10:00:00Z`;
    builder.recording(
      makeMe.aLaunchLanding
        .comparing({ base: revisionOf("prior1"), revision: facts.revision })
        .deliveredAs({ delivery: facts.receipt, receipt: facts.receipt })
        .receivedAt(facts.at)
        .please(),
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          state: "pass",
          runId,
          runAttempt: 1,
          runUrl: `https://ci.invalid/runs/${runId}`,
          startedAt: start,
          completedAt: new Date(
            Date.parse(start) + (selected ? 120000 : 100000),
          ).toISOString(),
          proof: makeMe.aCiProof
            .forRun({ revision, runId })
            .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
            .please(),
        })
        .please(),
      title === "execution" ? "equivalent" : future ? "later" : "exact",
    );
  }
  await keepLandedCiHistory(home, builder.please());
  const read = async (title: string) => {
    const query = new URLSearchParams({
      source: "open-dough",
      intent: "ci-history",
      revision: revisionOf(title),
      through: landing(title).at,
    });
    const named = parseIntentCiHistoryRead(query);
    expect(named).toMatchObject({ kind: "intent-ci-history" });
    if (named?.kind !== "intent-ci-history")
      throw new Error("expected intent-ci-history read");
    const outcome = await performIntentCiHistoryRead(source, named, { home });
    return outcome;
  };
  expect(await read("execution")).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: revisionOf("execution"),
      availability: "retained",
      reference: {
        endpoint: revisionOf("execution"),
        selected: { key: "run/6/1", ms: 120000 },
        sampleCount: 5,
        averageMs: 100000,
        difference: { changeMs: 20000, relative: 0.2 },
        evidence: [
          ...[1, 2, 3, 4, 5].map((runId) => ({
            key: `run/${runId}/1`,
            status: "included",
          })),
          { key: "run/6/1", status: "selected" },
          {
            key: "run/10/1",
            status: "excluded",
            reason: "Measured build is at or after the selected endpoint",
          },
          {
            key: "run/9/1",
            status: "excluded",
            reason: "No represented landing before the selected endpoint",
          },
        ],
      },
    },
  });
  expect(await read("cancelled")).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: revisionOf("cancelled"),
      reference: {
        selected: { key: "run/10/1", ms: 100000 },
        sampleCount: 5,
        averageMs: 100000,
      },
    },
  });
});
