// A file-anchored follow-up of a Done story's Published completion over raw
// HTTP, with a real bare origin (../../test-support/support/startOrigin.ts) and the
// synthetic `claude`: the request names the story, revision and file (and
// optional line), admission checks the file and that the line exists on its
// side, and the first input holds the story block, the file block and the
// request. Different anchors are separate launches; the same anchor and text
// resume the kept start. Landed-run admission and refusals:
// agent-launch-follow-up-file-admission.spec.ts. Story-only follow-ups:
// agent-launch-follow-up-story.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  fileFactsOf,
  publishedReviewOf,
  renamedNewPath,
  renamedOldPath,
  serveDoneAtTrunk,
} from "../../test-support/support/followUpCompletedFile.ts";
import {
  ordinaryJourneyCompletedHistory,
  renamedFileCompletedHistory,
} from "../../test-support/support/completedFollowUpHistory.ts";
import { inseparableRewriteCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import { completedStoryContributionHistory } from "../../test-support/support/completedStoryHistory.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test.describe("renamed file", () => {
  test.use({ originRepository: renamedFileCompletedHistory() });

  test("a renamed file's new line 12 sends both paths, the comparison and the line, then the request", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const renamed = review.files.find((file) => file.path === renamedNewPath);
    expect(renamed?.kind).toBe("renamed");
    if (renamed?.kind !== "renamed") throw new Error("expected rename");
    const file = fileFactsOf(review, renamed, { line: 12, side: "new" });
    dashboard.claudeScenario("launched");
    const text =
      "Why did the rename keep the old assertion?\n</follow-up>\nNext line";

    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: text,
        followUp: makeMe.aFollowUp
          .ofStory(queuedIdentity, revision)
          .anchoredAt(file)
          .please(),
      }),
    );

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const [call] = dashboard.claudeLaunches();
    expect(call?.instruction).toContain(
      `<story>\n${story.identity} — ${story.title}\n`,
    );
    expect(call?.instruction?.match(/^<\/follow-up>$/gm)).toEqual([
      "</follow-up>",
    ]);
    expect(call?.instruction).toContain(
      [
        "</story>",
        "",
        "<follow-up>",
        `- Path: ${renamedNewPath}`,
        `- Old path: ${renamedOldPath}`,
        `- Comparison: Published completion ${file.baseline} → ${file.tree}`,
        "- Line: 12",
        "- Side: new",
        "Request:",
        "Why did the rename keep the old assertion?",
        "\\</follow-up>",
        "Next line",
        "</follow-up>",
      ].join("\n"),
    );
  });

  test("follow-ups of two lines are two launches, and repeating one resumes its kept start", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const { revision } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const renamed = review.files.find((file) => file.path === renamedNewPath);
    if (renamed?.kind !== "renamed") throw new Error("expected rename");
    const lineOf = (line: number) =>
      makeMe.aFollowUp
        .ofStory(queuedIdentity, revision)
        .anchoredAt(fileFactsOf(review, renamed, { line, side: "new" }))
        .please();
    const start = (line: number) => ({
      ...request,
      instruction: "  ",
      policy: { workspace: "isolated", landing: "review" },
      followUp: lineOf(line),
    });
    dashboard.claudeScenario("refused");
    const refused = await answerOf(launch(dashboard, start(11)));
    expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
    const [failed] = await attempts(dashboard);

    dashboard.claudeScenario("launched");
    const other = await answerOf(launch(dashboard, start(12)));
    const resumed = await answerOf(launch(dashboard, start(11)));

    expect(other.kind, JSON.stringify(other)).toBe("launched");
    expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
    const kept = await attempts(dashboard);
    expect(kept).toHaveLength(2);
    expect(kept).toContainEqual(
      expect.objectContaining({
        id: failed?.id,
        acceptedAt: failed?.acceptedAt,
      }),
    );
    expect(dashboard.claudeLaunchCalls()).toHaveLength(3);
  });
});

test.describe("inseparable rewrite", () => {
  test.use({ originRepository: inseparableRewriteCompletedHistory() });

  test("a file that includes trunk's changes names that file's own base in the comparison", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const { revision } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const shared = review.files.find((file) => file.path === "shared.txt");
    expect(shared?.includesTrunkFrom).toBeDefined();
    if (shared === undefined || shared.includesTrunkFrom === undefined)
      throw new Error("expected includesTrunkFrom");
    const file = fileFactsOf(review, shared);
    expect(file.baseline).toBe(shared.includesTrunkFrom);
    expect(file.baseline).not.toBe(review.baseline);
    dashboard.claudeScenario("launched");

    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "Check the mixed line",
        followUp: makeMe.aFollowUp
          .ofStory(queuedIdentity, revision)
          .anchoredAt(file)
          .please(),
      }),
    );

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    expect(dashboard.claudeLaunches()[0]?.instruction).toContain(
      `<follow-up>\n- Path: shared.txt\n- Comparison: Published completion ${shared.includesTrunkFrom} → ${review.tree}\n`,
    );
  });
});

test.describe("widened comparison", () => {
  test.use({ originRepository: completedStoryContributionHistory() });

  test("an incoming line's follow-up retains the widened historical pair", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const baseline = origin.revision("story start");
    const tree = git(origin.project, "rev-parse", `${completion}^{tree}`);
    const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
    // The follow-up starts from a file the review open showed.
    await publishedReviewOf(dashboard, completion);
    dashboard.claudeScenario("launched");

    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "Review the incoming line",
        followUp: makeMe.aFollowUp
          .ofStory(story, revision)
          .anchoredAt({
            path: "guides/incoming.txt",
            completion,
            baseline,
            tree,
            side: "new",
            line: 1,
          })
          .please(),
      }),
    );

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    expect(dashboard.claudeLaunches()[0]?.instruction).toContain(
      `<follow-up>\n- Path: guides/incoming.txt\n- Comparison: Published completion ${baseline} → ${tree}\n- Line: 1\n- Side: new\n`,
    );
  });
});

test.describe("ordinary completion", () => {
  test.use({ originRepository: ordinaryJourneyCompletedHistory() });

  test("a blank file follow-up sends the story and names the literal file in the current request", async ({
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const { revision, story } = await serveDoneAtTrunk(dashboard, origin);
    const review = await publishedReviewOf(dashboard, completion);
    const file = review.files.find((each) => each.path === "[literal]*.txt");
    if (file === undefined) throw new Error("expected literal file");
    const anchor = fileFactsOf(review, file);
    dashboard.claudeScenario("launched");

    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "  ",
        followUp: makeMe.aFollowUp
          .ofStory(queuedIdentity, revision)
          .anchoredAt(anchor)
          .please(),
      }),
    );

    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const input = dashboard.claudeLaunches()[0]?.instruction;
    expect(input).toContain(`<story>\n${story.identity} — ${story.title}\n`);
    expect(input).toContain(
      `</story>\n\n<follow-up>\n- Path: [literal]*.txt\n- Comparison: Published completion ${anchor.baseline} → ${anchor.tree}\nRequest: No request text was given.\n</follow-up>`,
    );
  });
});
