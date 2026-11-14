// The same actual proof owner serves running, inactive and provisional contexts.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciTargetOf } from "../../src/intentCiTarget.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { takenTrunkComparison } from "../../tests/support/comparisonMountSelections.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";

test("running Landed reads only Baseline and Branch and keeps their one shared proof selection", async () => {
  const facts = preparedComparison();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: { ...facts.answer.landed, kind: "running" },
    })
    .please();
  const client = ciComparisonClient(facts.source, (query) =>
    Response.json(
      query.get("intent") === "ci-comparison"
        ? answer
        : facts.proof(Number(query.get("run"))),
    ),
  );
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
    expect(client.view()?.active).toMatchObject({
      title: "Baseline compared with Branch",
      landedUnusedReason: "Build is still running.",
    });
    expect(
      client.requests
        .filter(({ url }) => url.includes("intent=ci-proof"))
        .map(({ url }) => url),
    ).toEqual([
      `/__authenticated-read?source=example&intent=ci-proof&run=1&attempt=1&revision=${"a".repeat(40)}`,
      `/__authenticated-read?source=example&intent=ci-proof&run=2&attempt=1&revision=${"b".repeat(40)}`,
    ]);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
  } finally {
    client.dispose();
  }
});

test("a queued target leaves the prior selection and acquires no comparison or proofs", async () => {
  const facts = preparedComparison();
  const identity = "SEED-B#b";
  const work = makeMe.aPublishedWork
    .with({
      ...facts.work,
      backlog: [
        {
          identity,
          title: "Story B",
          canonical: {
            kind: "external",
            recorded: "https://example.test/b",
            url: "https://example.test/b",
          },
        },
      ],
    })
    .please();
  const client = ciComparisonClient(facts.source, (query) =>
    Response.json(
      query.get("intent") === "ci-comparison"
        ? facts.answer
        : facts.proof(Number(query.get("run"))),
    ),
  );
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 3 });
    expect(ciTargetOf(facts.source, work, identity)).toMatchObject({
      kind: "gap",
      story: "Story B",
    });
    // A gap supplies no comparison identity to the owner's public selection.
    await client.comparison.select(facts.source, undefined);
    await client.readProofs();
    expect(client.comparison.getSnapshot()).toMatchObject({
      shown: undefined,
      failed: undefined,
      checkedAgain: 0,
    });
    expect(client.view()).toBeUndefined();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 3 });
  } finally {
    client.dispose();
  }
});

test("Taken Story Branch targets its live branch and reads only two provisional comparison proofs", async () => {
  const facts = preparedComparison();
  const taken = takenTrunkComparison(facts);
  const assigned = taken.work.taken[0];
  if (assigned?.owner?.status !== "recorded")
    throw new Error("A recorded Taken assignment is required");
  const work = makeMe.aPublishedWork
    .with({
      ...taken.work,
      taken: [
        {
          ...assigned,
          owner: {
            ...assigned.owner,
            assignments: assigned.owner.assignments.map((owner) => ({
              ...owner,
              mode: "story-branch",
              branch: "feature/a",
            })),
          },
        },
      ],
    })
    .please();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      phase: "taken",
      landed: {
        kind: "not-landed",
        explanation: "The story has not landed yet.",
      },
    })
    .please();
  const client = ciComparisonClient(facts.source, (query) =>
    Response.json(
      query.get("intent") === "ci-comparison"
        ? answer
        : facts.proof(Number(query.get("run"))),
    ),
  );
  try {
    expect(ciTargetOf(facts.source, work, facts.identity)).toMatchObject({
      kind: "judged",
      branch: "feature/a",
      comparisonIdentity: "SEED-A#a",
    });
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.view()?.answer).toMatchObject({
      phase: "taken",
      mode: "story-branch",
      landed: {
        kind: "not-landed",
        explanation: "The story has not landed yet.",
      },
    });
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
    // Parent kept/fresh statuses2 is a real provider binding obligation.
  } finally {
    client.dispose();
  }
});
