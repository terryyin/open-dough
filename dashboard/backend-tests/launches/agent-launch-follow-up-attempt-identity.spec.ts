// Follow-ups of two sources with the same words and choices are two kept
// attempts. Repeating one after the host refused resumes that attempt, and
// still sends its saved context once the source record is gone.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  doneFollowUpSession,
  followUpStart,
  sessionContextInput,
  twoStoryReads,
  withFollowUpAttempts,
  type FollowUpAttempts,
} from "./followUpAttemptIdentity.ts";
import { otherStory, recoverStory, revision } from "./storyFollowUpInput.ts";

const instruction = "Continue";
const storyIdentity = "SEED-A#a";
const report = "The cache key changed; I restored it.\nCI now takes 4 minutes.";
const landed = "ab".repeat(20);
const reportedTitle = "Why is the CI slow on main?";
const quietTitle = "Tidy the changelog";
const preamble =
  "Follow-up context: this session follows up earlier work in this project whose conversation can no longer be continued. These are the records the dashboard still holds of it; they state nothing beyond what was recorded.";
const contextOf = (title: string, items: readonly string[]) =>
  [preamble, `Session “${title}”:`, ...items].join("\n");
const reportedContext = contextOf(reportedTitle, [
  "- Workflow: Ad hoc",
  `- Story: ${storyIdentity}`,
  `- Original request: ${reportedTitle}`,
  "- Final report (Completed with attention):",
  report,
  `- Landed at revision: ${landed}`,
]);
const quietContext = contextOf(quietTitle, [
  "- Workflow: Ad hoc",
  `- Story: ${storyIdentity}`,
  `- Original request: ${quietTitle}`,
  "- Final report: No final report was submitted.",
]);
const completed = "8 Nov 2026, 09:05 UTC by Terry Yin with viktor-chan";
const storyContext = (story: {
  readonly identity: string;
  readonly title: string;
}) =>
  [
    [
      "<story>",
      `${story.identity} — ${story.title}`,
      `- Completed: ${completed}`,
      `- Status: Done. Its seed and plan may have been removed; its records remain in the project's history under ${story.identity}.`,
      "- Sessions: No session context is retained.",
      "</story>",
    ].join("\n"),
    `<follow-up>\nRequest:\n${instruction}\n</follow-up>`,
  ].join("\n\n");
const recoverContext = storyContext(recoverStory);
const otherContext = storyContext(otherStory);
const projectId = makeMe.aPublishedSource.openDough.please().id;

function sentOnce(input: string, context: string) {
  expect(input).toBe([context, instruction].join("\n\n"));
  expect(input.split(instruction).length - 1).toBe(1);
}

async function refusedAttempt(host: FollowUpAttempts) {
  const [failed] = await host.attempts();
  expect(failed?.outcome).toMatchObject({
    kind: "failed",
    reason: "refused",
    sessionStartKept: true,
  });
  if (failed === undefined) throw new Error("Missing retained attempt");
  return failed;
}

test("follow-ups of two sessions with the same words and choices are two launches", async () => {
  const reported = doneFollowUpSession(
    projectId,
    reportedTitle,
    "reported-source",
    { message: report, landed },
    storyIdentity,
  );
  const quiet = doneFollowUpSession(
    projectId,
    quietTitle,
    "quiet-source",
    { message: "" },
    storyIdentity,
  );
  await withFollowUpAttempts(
    sessionContextInput(projectId, [reported, quiet], storyIdentity),
    async (host) => {
      for (const source of [reported, quiet]) {
        expect(
          (
            await host.accept(
              followUpStart(
                projectId,
                makeMe.aFollowUp.ofSession(source).please(),
              ),
            )
          ).kind,
        ).toBe("accepted");
      }

      const kept = await host.attempts();
      expect(kept).toHaveLength(2);
      expect(new Set(kept.map(({ id }) => id)).size).toBe(2);
      expect(kept[0]?.request).toMatchObject({
        followUp: { context: reportedContext },
      });
      expect(kept[1]?.request).toMatchObject({
        followUp: { context: quietContext },
      });
      sentOnce(host.runs[0]?.input ?? "", reportedContext);
      sentOnce(host.runs[1]?.input ?? "", quietContext);
    },
  );
});

test("is resumed by repeating the same follow-up", async () => {
  const reported = doneFollowUpSession(
    projectId,
    reportedTitle,
    "reported-source",
    { message: report, landed },
    storyIdentity,
  );
  await withFollowUpAttempts(
    sessionContextInput(projectId, [reported], storyIdentity),
    async (host) => {
      const request = followUpStart(
        projectId,
        makeMe.aFollowUp.ofSession(reported).please(),
      );
      host.refuse();
      expect((await host.accept(request)).kind).toBe("accepted");
      const failed = await refusedAttempt(host);

      host.launch();
      expect((await host.accept(request)).kind).toBe("accepted");

      expect(await host.attempts()).toEqual([
        expect.objectContaining({
          id: failed.id,
          acceptedAt: failed.acceptedAt,
        }),
      ]);
      const resumed = host.runs[1];
      sentOnce(resumed?.input ?? "", reportedContext);
      expect(resumed?.request).toMatchObject({
        followUp: { context: reportedContext },
      });
      expect(resumed?.id).toBe(failed.id);
      expect(resumed?.acceptedAt).toBe(failed.acceptedAt);
    },
  );
});

test("repeating a retained follow-up after the source record is removed resumes it with the saved context", async () => {
  const reported = doneFollowUpSession(
    projectId,
    reportedTitle,
    "reported-source",
    { message: report, landed },
    storyIdentity,
  );
  const sources = [reported];
  await withFollowUpAttempts(
    sessionContextInput(projectId, sources, storyIdentity),
    async (host) => {
      const request = followUpStart(
        projectId,
        makeMe.aFollowUp.ofSession(reported).please(),
      );
      host.refuse();
      expect((await host.accept(request)).kind).toBe("accepted");
      const failed = await refusedAttempt(host);
      sources.splice(0, sources.length);

      host.launch();
      expect((await host.accept(request)).kind).toBe("accepted");

      expect(await host.attempts()).toEqual([
        expect.objectContaining({
          id: failed.id,
          acceptedAt: failed.acceptedAt,
        }),
      ]);
      const resumed = host.runs[1];
      sentOnce(resumed?.input ?? "", reportedContext);
      expect(resumed?.request).toMatchObject({
        instruction,
        followUp: { context: reportedContext },
      });
    },
  );
});

test("follow-ups of two stories with the same words and choices are two launches, and repeating one resumes its kept start", async () => {
  const { asked, input } = twoStoryReads(projectId);
  await withFollowUpAttempts(input, async (host) => {
    const start = (story: typeof recoverStory) =>
      followUpStart(
        projectId,
        makeMe.aFollowUp.ofStory(story, revision).please(),
      );
    host.refuse();
    expect((await host.accept(start(recoverStory))).kind).toBe("accepted");
    const failed = await refusedAttempt(host);

    host.launch();
    expect((await host.accept(start(otherStory))).kind).toBe("accepted");
    expect((await host.accept(start(recoverStory))).kind).toBe("accepted");

    const kept = await host.attempts();
    expect(kept).toHaveLength(2);
    expect(kept).toContainEqual(
      expect.objectContaining({ id: failed.id, acceptedAt: failed.acceptedAt }),
    );
    const resumed = host.runs.filter((run) => run.id === failed.id);
    expect(resumed).toHaveLength(2);
    expect(resumed[1]?.input).toBe(recoverContext);
    expect((resumed[1]?.input ?? "").split(instruction).length - 1).toBe(1);
    expect(resumed[1]?.request).toMatchObject({
      followUp: { context: { message: recoverContext } },
    });
    expect(resumed[1]?.acceptedAt).toBe(failed.acceptedAt);
    const other = host.runs.find((run) => run.id !== failed.id);
    expect(other?.input).toBe(otherContext);
    expect((other?.input ?? "").split(instruction).length - 1).toBe(1);
    expect(asked).toEqual([
      { revision, files: [doneRecordFileName(recoverStory.identity)] },
      { revision, files: [doneRecordFileName(otherStory.identity)] },
    ]);
  });
});
