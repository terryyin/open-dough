// Selection and observed-tip facts consumed by the same provider mount.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  preparedComparison,
  comparisonCheckedAt,
} from "./comparisonMountFacts.ts";

export function otherComparedStory(
  facts: ReturnType<typeof preparedComparison>,
) {
  const identity = "SEED-B#b";
  const revision = "d".repeat(40);
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      identity,
      baseline: { ...facts.answer.baseline, revision, runId: 4 },
    })
    .please();
  const work = makeMe.aPublishedWork
    .with({
      ...facts.work,
      done: {
        status: "catalogued",
        revision: facts.work.revision,
        records: [
          {
            identity,
            completedAt: comparisonCheckedAt,
            fileName: "SEED-B_b.json",
            blob: "e".repeat(40),
          },
        ],
        unreadable: [],
      },
    })
    .please();
  const proof = (run: number) =>
    run === 4
      ? makeMe.anIntentCiProofAnswer
          .with({
            runId: 4,
            runAttempt: 1,
            revision,
            checkedAt: comparisonCheckedAt,
            proof: makeMe.aCiProof
              .summaryFor({ runId: 4, runAttempt: 1, revision }, [
                makeMe.aCiProofEntry
                  .at("dashboard/tests")
                  .counting(10)
                  .timed(10_000)
                  .please(),
              ])
              .please(),
          })
          .please()
      : facts.proof(run);
  return { source: facts.source, identity, work, answer, proof };
}

export function takenTrunkComparison(
  facts: ReturnType<typeof preparedComparison>,
) {
  const work = makeMe.aPublishedWork
    .with({
      source: facts.source,
      revision: facts.answer.branch.revision,
      retrievedAt: facts.work.retrievedAt,
      direction: "",
      backlog: [],
      taken: [
        {
          identity: facts.identity,
          title: "Story A",
          canonical: {
            kind: "external",
            recorded: "https://example.test/story",
            url: "https://example.test/story",
          },
          owner: {
            status: "recorded",
            assignments: [
              {
                profilePath: ".planning/agents/engineer.json",
                name: "engineer",
                agent: "engineer",
                mode: "trunk",
                branch: "main",
                host: undefined,
                model: undefined,
                human: { status: "no-addition" },
              },
            ],
          },
        },
      ],
    })
    .please();
  const answer = makeMe.aStoryCiComparison
    .with({
      kind: "comparison",
      phase: "taken",
      mode: "trunk",
      identity: facts.identity,
      storyStart: facts.answer.storyStart,
      checkedAt: comparisonCheckedAt,
      baseline: facts.answer.baseline,
      branch: makeMe.aStoryCiComparisonSlot
        .with({
          kind: "not-applicable",
          explanation: "Trunk Mode has no Branch build.",
        })
        .please(),
      landed: makeMe.aStoryCiComparisonSlot
        .with({
          kind: "not-landed",
          explanation: "The story has not landed yet.",
        })
        .please(),
      provisional: facts.answer.branch,
    })
    .please();
  return { source: facts.source, identity: facts.identity, work, answer };
}
