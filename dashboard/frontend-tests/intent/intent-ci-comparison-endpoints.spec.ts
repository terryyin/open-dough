// Each comparison endpoint names the real build it stands for: exact,
// ancestor, equivalent and later trunk sources, skipped and cancelled
// requests, and missing, failed or not applicable endpoints.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { selectionWords } from "../../src/storyCiComparisonWording.ts";
import { mountComparison } from "./intent-ci-comparison-page.ts";

const noBuild = (explanation: string) => ({
  kind: "none" as const,
  explanation,
});
const runOrAttemptIds = /run \d+|attempt /i;
const exactSource = {
  selection: "exact",
  title: "exact revision",
  visible: true,
};

test("exact, ancestor and equivalent builds name their source in accessible and hover words without run identities", async () => {
  const skipped =
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor ccccccc.";
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withBaseline({
        selection: "ancestor",
        laterWithoutResult: 2,
        requestedStatus: {
          kind: "no-build",
          explanation:
            "No build at ddddddd: the workflow at that revision could not be read.",
        },
      })
      .withLanded({
        selection: "equivalent",
        requestedStatus: { kind: "skipped", explanation: skipped },
      })
      .withMixedEntries()
      .please(),
  );
  await expect.poll(() => comparison.identities()).toHaveLength(3);
  const [baseline, branch, landed] = comparison.identities();
  expect(baseline?.text).toContain(
    "No build at ddddddd: the workflow at that revision could not be read.",
  );
  expect(baseline?.text).toContain("aaaaaaa");
  expect(baseline?.sources).toEqual([
    {
      selection: "ancestor",
      title: "ancestor: 2 later revisions without a build",
      visible: true,
    },
  ]);
  expect(baseline?.text).toContain(
    "ancestor: 2 later revisions without a build",
  );
  expect(branch?.text).toContain("bbbbbbb");
  expect(branch?.text).toContain("exact revision");
  expect(branch?.sources).toEqual([exactSource]);
  expect(landed?.text).toContain("ccccccc");
  expect(landed?.text).toContain("equivalent build");
  expect(landed?.text).not.toContain(skipped);
  expect(landed?.sources).toEqual([]);
  for (const { text } of comparison.identities()) {
    expect(text).not.toMatch(runOrAttemptIds);
    expect(text).not.toMatch(/before|branch|landed/);
  }
  await expect
    .element(
      page.getByRole("columnheader", { name: "CI wall time", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(
      page.getByRole("columnheader", {
        name: "CI time without runner waits",
        exact: true,
      }),
    )
    .toBeVisible();
});

test("a skipped ancestor keeps its source quietly while cancelled ancestor and later trunk builds show the cancellation", async () => {
  const cancelled = {
    kind: "cancelled" as const,
    explanation: "Cancelled at ddddddd.",
  };
  const skipped =
    "Skipped at ddddddd because CI ignores every change since its nearest built ancestor aaaaaaa.";
  const story = (baselineStatus: {
    kind: "skipped" | "cancelled";
    explanation: string;
  }) =>
    makeMe.aComparedStory
      .wallTimed()
      .withBaseline({
        selection: "ancestor",
        laterWithoutResult: 1,
        requestedStatus: baselineStatus,
      })
      .withLanded({
        selection: "later",
        laterWithoutResult: 1,
        requestedStatus: cancelled,
      })
      .withMixedEntries()
      .please();
  const ancestorSource = [
    {
      selection: "ancestor",
      title: "ancestor: 1 later revision without a build",
      visible: true,
    },
  ];
  const comparison = await mountComparison(
    story({ kind: "skipped", explanation: skipped }),
  );
  await expect.poll(() => comparison.identities()).toHaveLength(3);
  const [baseline, , landed] = comparison.identities();
  expect(baseline?.text).not.toContain(skipped);
  expect(baseline?.text).toContain("aaaaaaa");
  expect(baseline?.text).toContain(
    "ancestor: 1 later revision without a build",
  );
  expect(baseline?.sources).toEqual(ancestorSource);
  expect(landed?.text).toContain("Cancelled at ddddddd.");
  expect(landed?.text).toContain("ccccccc");
  expect(landed?.text).toContain(
    "later trunk build: includes 1 later trunk revision",
  );
  for (const { text } of comparison.identities())
    expect(text).not.toMatch(runOrAttemptIds);
  expect(comparison.wallTimes()[0]).toBe("3 min");
  expect(comparison.wallTimes()[2]).toBe("4 min");

  comparison.showsStory(story(cancelled));
  await expect
    .poll(() => comparison.identities()[0]?.text)
    .toContain("Cancelled at ddddddd.");
  expect(comparison.identities()[0]?.sources).toEqual(ancestorSource);
  expect(comparison.identities()[0]?.text).toContain("aaaaaaa");
  expect(comparison.identities()[0]?.text).not.toMatch(runOrAttemptIds);
  expect(comparison.wallTimes()[0]).toBe("3 min");
});

test("later and ancestor selection words count the revisions each build passes over", () => {
  const selectedBuild = (
    selection: "later" | "ancestor",
    laterWithoutResult: number,
  ) => {
    const { landed } = makeMe.aComparedStory
      .withLanded({ selection, laterWithoutResult })
      .please().answer;
    if (landed.kind !== "build") throw new Error("Landed is not a build");
    return selectionWords(landed);
  };
  expect(selectedBuild("later", 1)).toBe(
    "later trunk build: includes 1 later trunk revision",
  );
  expect(selectedBuild("later", 3)).toBe(
    "later trunk build: includes 3 later trunk revisions",
  );
  expect(selectedBuild("ancestor", 1)).toBe(
    "ancestor: 1 later revision without a build",
  );
  expect(selectedBuild("ancestor", 2)).toBe(
    "ancestor: 2 later revisions without a build",
  );
});

test("missing, failed and not applicable endpoints keep the other builds' wall times without a fabricated zero", async () => {
  const gap = noBuild(
    "No build at ddddddd: the workflow at that revision could not be read.",
  );
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAnswer({ branch: gap, landed: gap })
      .withMixedEntries()
      .please(),
  );
  await expect.poll(() => comparison.wallTimes()).toEqual(["3 min", "—", "—"]);
  expect(comparison.identities()[0]?.text).toContain("aaaaaaa");
  expect(
    comparison
      .identities()
      .slice(1)
      .map(({ text }) => text),
  ).toEqual([gap.explanation, gap.explanation]);
  expect(comparison.text()).not.toContain("run 498");
  expect(comparison.text()).not.toContain("10 min");

  comparison.showsStory(
    makeMe.aComparedStory
      .wallTimed()
      .withLanded({ state: "failed" })
      .withMixedEntries()
      .please(),
  );
  await expect
    .poll(() => comparison.identities()[2]?.text)
    .toContain("failed build");
  const failed = comparison.identities()[2];
  expect(failed?.text).toContain("ccccccc");
  expect(failed?.text).toContain("exact revision");
  expect(failed?.sources).toEqual([exactSource]);
  expect(failed?.text).not.toContain("ddddddd");
  expect(failed?.text).not.toContain("eeeeeee");
  expect(failed?.text).not.toMatch(runOrAttemptIds);
  expect(comparison.wallTimes()[1]).toBe("3 min 20 s");
  expect(comparison.text()).not.toContain("10 min");

  comparison.showsStory(
    makeMe.aComparedStory
      .wallTimed()
      .withAnswer({
        mode: "trunk",
        branch: {
          kind: "not-applicable",
          explanation: "Branch is not applicable in Trunk Mode.",
        },
      })
      .withLanded({ selection: "ancestor", laterWithoutResult: 1 })
      .withMixedEntries()
      .please(),
  );
  await expect
    .poll(() => comparison.identities()[1]?.text)
    .toContain("not applicable");
  const landed = comparison.identities()[2];
  expect(landed?.text).toContain("ccccccc");
  expect(landed?.text).toContain("ancestor:");
  expect(
    landed?.sources.map(({ selection, visible }) => ({ selection, visible })),
  ).toEqual([{ selection: "ancestor", visible: true }]);
});
