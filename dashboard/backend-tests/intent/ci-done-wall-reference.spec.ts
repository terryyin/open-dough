// Exact Done publication boundaries traverse the authenticated local reader.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { landedTrunk } from "../../tests/support/landedCiTrunk.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";

test.use({ serverMode: "boundary" });

test("a Done read uses its exact publication, excludes its shared equivalent attempt and a cancelled future proxy, and keeps a later selected measurement", async ({
  dashboard,
  origin,
  github,
}) => {
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
  const trunk = landedTrunk(
    origin,
    names.map((title) => ({ title, kind: "code" })),
    names,
  );
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(
    trunk.landings.map(({ revision }) => revision),
  );
  for (const [index, title] of names.entries()) {
    const facts = trunk.landing(title);
    const selected = title === "execution" || title === "shared";
    const future = title === "cancelled";
    const runId = selected ? 6 : future ? 10 : index + 1;
    const revision = trunk.revision(
      selected ? "shared" : future ? "publication" : title,
    );
    const start = `2026-11-${String(runId).padStart(2, "0")}T10:00:00Z`;
    builder.recording(
      makeMe.aLaunchLanding
        .capturedFrom({
          repository: commonGitDir(origin.project),
          identity: "SEED-9#same-story",
        })
        .comparing({ base: trunk.revision("prior1"), revision: facts.revision })
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
  keepLandedCiHistory(dashboard.home, builder.please());
  const read = async (title: string) => {
    const query = new URLSearchParams({
      source: "open-dough",
      intent: "ci-history",
      revision: trunk.revision(title),
      through: trunk.landing(title).at,
    });
    const response = await rawRequest({
      url: `${dashboard.origin}/__authenticated-read?${query}`,
      headers: { Origin: dashboard.origin },
    });
    return {
      status: response.status,
      body: JSON.parse(response.body) as unknown,
    };
  };
  const before = github.calls.length;
  expect(await read("execution")).toMatchObject({
    status: 200,
    body: {
      selectedRevision: trunk.revision("execution"),
      availability: "retained",
      reference: {
        endpoint: trunk.revision("execution"),
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
    status: 200,
    body: {
      selectedRevision: trunk.revision("cancelled"),
      reference: {
        selected: { key: "run/10/1", ms: 100000 },
        sampleCount: 5,
        averageMs: 100000,
      },
    },
  });
  expect(github.calls).toHaveLength(before);
});
