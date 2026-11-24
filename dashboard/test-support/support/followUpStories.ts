// Done stories a follow-up names (`../../src/followUpRequest.ts`): their
// published done records with the catalog completion publishes beside them,
// the Done sessions this machine keeps for them, and the context text a
// session receives for one (`../../src/followUpContext.ts`), spelled out for
// black-box assertions. Done sessions of no story: ./followUpSources.ts.

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { describedFiles } from "../describedRevisions.ts";

type Story = { readonly identity: string; readonly title: string };

export const recoverStory: Story = {
  identity: "SEED-269#recover-terminal-insert",
  title: "Recover dictation and Paste in the embedded terminal",
};
export const otherStory: Story = {
  identity: "SEED-267#keep-the-terminal-scroll",
  title: "Keep the terminal scroll",
};
export const reopenableStory: Story = {
  identity: "SEED-268#name-the-terminal-tab",
  title: "Name the terminal tab",
};

// How the follow-up names a story and its source row reads.
export const storyNameOf = ({ identity, title }: Story) =>
  `${identity} — ${title}`;

// The done records of `stories`, completed at `completedAt` by Terry Yin with
// viktor-chan in Codex.
export const doneStoryRecords = (
  stories: readonly Story[],
  completedAt: string,
) =>
  stories.map((story) =>
    makeMe.aDoneRecord
      .with({
        ...story,
        completedAt,
        developer: "Terry Yin",
        agent: "viktor-chan",
        host: "codex",
      })
      .please(),
  );

// Those records with their catalog, as `complete` publishes them, for a
// harness serving them without a backlog.
export const doneStoryFiles = (
  stories: readonly Story[],
  completedAt: string,
): Record<string, string> =>
  describedFiles({
    backlog: null,
    doneRecords: doneStoryRecords(stories, completedAt),
  });

// The story's Done refinement and execution, both completed quietly and
// marked done at `doneAt`; the worktree each ran in was retired.
export const quietStorySessions = (
  home: string,
  story: Story,
  doneAt: Date,
  details?: {
    readonly refinement: {
      readonly instruction: string;
      readonly report: string;
    };
    readonly execution: {
      readonly instruction: string;
      readonly report: string;
    };
  },
): LaunchRecord[] => {
  const slug = story.identity.split("#")[1] ?? "story";
  return [
    makeMe.aLaunchRecord
      .refining({
        ...story,
        ...(details && { instruction: details.refinement.instruction }),
      })
      .inClaudeSession({ sessionId: `${slug}-refined`, shortId: "refined" })
      .onStoryBranch({
        workspace: path.join(home, "retired", `${slug}-refinement`),
        branch: `claude/${slug}-refinement`,
      })
      .launchedAt(new Date(doneAt.getTime() - 120_000).toISOString())
      .completedWith({ message: details?.refinement.report ?? "" })
      .markedDoneAt(doneAt.toISOString())
      .please(),
    makeMe.aLaunchRecord
      .executing({
        ...story,
        ...(details && { instruction: details.execution.instruction }),
      })
      .inClaudeSession({ sessionId: `${slug}-executed`, shortId: "executed" })
      .onStoryBranch({
        workspace: path.join(home, "retired", slug),
        branch: `claude/${slug}`,
      })
      .launchedAt(new Date(doneAt.getTime() - 60_000).toISOString())
      .completedWith({ message: details?.execution.report ?? "" })
      .markedDoneAt(doneAt.toISOString())
      .please(),
  ];
};

// When a story was completed, as the context says it.
export const completedWords = (completedAt: string) =>
  `${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(new Date(completedAt))} UTC by Terry Yin with viktor-chan`;

// The required context items as the dialog lists them.
export function storyItems(
  story: Story,
  completedAt: string,
  held: "unselected" | "no session",
): string[] {
  return [
    `Completed: ${completedWords(completedAt)}`,
    `Status: Done. Its seed and plan may have been removed; its records remain in the project's history under ${story.identity}.`,
    ...(held === "no session"
      ? ["Sessions: No session context is retained."]
      : []),
  ];
}

// The first-input sections for a story whose sessions completed quietly.
export function storyContextOf(
  story: Story,
  completedAt: string,
  held: "quiet sessions" | "no session" | "unselected",
  instruction: string,
): string {
  const [completed = "", status = "", ...rest] = storyItems(
    story,
    completedAt,
    held === "quiet sessions" ? "unselected" : held,
  ).map((item) => `- ${item}`);
  const extras =
    held === "quiet sessions"
      ? ["Refinement", "Execution"].map((workflow) =>
          [
            "<session>",
            story.title,
            `- Workflow: ${workflow}`,
            `- Story: ${story.identity}`,
            "- Original request: No request text was given.",
            "- Final report: No final report was submitted.",
            "</session>",
          ].join("\n"),
        )
      : [];
  return [
    [
      "<story>",
      storyNameOf(story),
      completed,
      status,
      ...(held === "no session" ? rest : []),
      "</story>",
    ].join("\n"),
    `<follow-up>\nRequest:\n${instruction}\n</follow-up>`,
    ...extras,
  ].join("\n\n");
}
