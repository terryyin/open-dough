// Done stories a follow-up names (`../../src/followUpRequest.ts`): their
// published done records with the catalog completion publishes beside them,
// the Done sessions this machine keeps for them, and the context text a
// session receives for one (`../../src/followUpContext.ts`), spelled out for
// black-box assertions. Done sessions of no story: ./followUpSources.ts.

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { withDoneCatalog } from "../doneCatalogAnswers.ts";
import { followUpPreamble } from "./followUpSources.ts";

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
// viktor-chan in Codex, with their catalog, as `complete` publishes them.
export function doneStoryFiles(
  stories: readonly Story[],
  completedAt: string,
): Record<string, string> {
  return withDoneCatalog(
    Object.fromEntries(
      stories.map((story) => [
        `.planning/${doneRecordPath(story.identity)}`,
        renderDoneRecord(
          makeMe.aDoneRecord
            .with({
              ...story,
              completedAt,
              developer: "Terry Yin",
              agent: "viktor-chan",
              host: "codex",
            })
            .please(),
        ),
      ]),
    ),
    ".planning/done",
  );
}

// The story's Done refinement and execution, both completed quietly and
// marked done at `doneAt`; the worktree each ran in was retired.
export const quietStorySessions = (
  home: string,
  story: Story,
  doneAt: Date,
): LaunchRecord[] => {
  const slug = story.identity.split("#")[1] ?? "story";
  return [
    makeMe.aLaunchRecord
      .refining(story)
      .inClaudeSession({ sessionId: `${slug}-refined`, shortId: "refined" })
      .onStoryBranch({
        workspace: path.join(home, "retired", `${slug}-refinement`),
        branch: `claude/${slug}-refinement`,
      })
      .launchedAt(new Date(doneAt.getTime() - 120_000).toISOString())
      .completedWith({ message: "" })
      .markedDoneAt(doneAt.toISOString())
      .please(),
    makeMe.aLaunchRecord
      .executing(story)
      .inClaudeSession({ sessionId: `${slug}-executed`, shortId: "executed" })
      .onStoryBranch({
        workspace: path.join(home, "retired", slug),
        branch: `claude/${slug}`,
      })
      .launchedAt(new Date(doneAt.getTime() - 60_000).toISOString())
      .completedWith({ message: "" })
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

// The context items of a story completed at `completedAt`, holding the
// sessions of `quietStorySessions` or none, one line each as the dialog lists
// them.
export function storyItems(
  story: Story,
  completedAt: string,
  held: "quiet sessions" | "no session",
): string[] {
  const quiet = (workflow: string) => [
    `Workflow: ${workflow}`,
    `Story: ${story.identity}`,
    "Original request: No request text was given.",
    "Final report: No final report was submitted.",
  ];
  return [
    `Completed: ${completedWords(completedAt)}`,
    `Status: Done. Its seed and plan may have been removed; its records remain in the project's history under ${story.identity}.`,
    ...(held === "no session"
      ? ["Sessions: No session context is retained."]
      : [...quiet("Refinement"), ...quiet("Execution")]),
  ];
}

// The context block a session receives for a story completed at
// `completedAt`, as `storyItems` lists it.
export function storyContextOf(
  story: Story,
  completedAt: string,
  held: "quiet sessions" | "no session",
): string {
  const [completed = "", status = "", ...rest] = storyItems(
    story,
    completedAt,
    held,
  ).map((item) => `- ${item}`);
  const sessions =
    held === "no session"
      ? rest
      : [
          `Session “${story.title}”:`,
          ...rest.slice(0, 4),
          `Session “${story.title}”:`,
          ...rest.slice(4),
        ];
  return [
    followUpPreamble,
    `Done story “${storyNameOf(story)}”:`,
    completed,
    status,
    ...sessions,
  ].join("\n");
}

// The source a follow-up of `story`, shown at `revision`, names.
export const storyFollowUpOf = (story: Story, revision: string) => ({
  story: { identity: story.identity, revision },
});
