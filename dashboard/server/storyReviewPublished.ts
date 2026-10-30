// A completed story's immutable comparison comes from published done/profile
// history in its configured project, independently of local dashboard launches.
import path from "node:path";
import { realpath } from "node:fs/promises";
import {
  doneRecordFileName,
  parseDoneRecordFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  agentProfileDirectoryOf,
  doneRecordDirectoryOf,
} from "./recordsBesideBacklog.ts";
import { completedStoryCommits, trunkLess } from "./storyPublishedCommits.ts";
import {
  publishedStoryAgents,
  publishedStoryEvidence,
} from "./storyPublishedEvidence.ts";
import { listedFrom } from "./storyReviewComparison.ts";

export async function publishedStoryReview(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedCompletion?: string,
): Promise<StoryReview | undefined> {
  const unavailable = (explanation: string): StoryReview => ({
    kind: "unavailable",
    explanation,
  });
  const directory = projectFolder(source).path;
  const call: GitCall = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
  const git = async (...args: string[]) =>
    (await runGit(args, call)).stdout.trim();
  try {
    if (
      (await realpath(await git("rev-parse", "--show-toplevel"))) !==
      (await realpath(directory))
    )
      return unavailable(
        "The configured project folder is no longer this project's Git checkout.",
      );
    if (namedCompletion === undefined)
      await runGit(["fetch", "--quiet", "origin", source.ref], {
        ...call,
        env: { GIT_TERMINAL_PROMPT: "0" },
      });
    const published = await git(
      "rev-parse",
      "--verify",
      `origin/${source.ref}^{commit}`,
    );
    if (namedCompletion !== undefined)
      await git("merge-base", "--is-ancestor", namedCompletion, published);
    const at = namedCompletion ?? published;
    const fileName = doneRecordFileName(identity);
    const file = path.posix.join(doneRecordDirectoryOf(source), fileName);
    const listed = await git("ls-tree", "--name-only", at, "--", file);
    if (listed !== file) return undefined;
    const read = parseDoneRecordFile(
      fileName,
      await git("show", `${at}:${file}`),
    );
    const record = read.record;
    if (!read.ok || record === undefined || record.identity !== identity)
      return unavailable(
        "The published completion record is unreadable or names another story.",
      );
    // Path history fixes the completion, even after trunk advances or the
    // original execution branch is deleted. Never substitute today's trunk.
    const completion = await git(
      "log",
      "--first-parent",
      "-1",
      "--format=%H",
      at,
      "--",
      file,
    );
    if (!completion)
      return unavailable(
        "Published history is missing the completion revision.",
      );
    if (namedCompletion !== undefined && namedCompletion !== completion)
      return unavailable(
        "This revision is not the story's published completion.",
      );
    const story = {
      identity,
      profileDirectory: agentProfileDirectoryOf(source),
    };
    const recordedAgent: unknown = record.agent;
    let agent = typeof recordedAgent === "string" ? recordedAgent : undefined;
    if (agent === undefined) {
      if ((await git("rev-parse", "--is-shallow-repository")) === "true")
        return unavailable(
          "Published execution claim history is shallow, so a unique execution agent cannot be recovered safely.",
        );
      const claiming: string[] = [];
      for (const candidate of await publishedStoryAgents(
        story,
        completion,
        call,
      )) {
        if (
          (await publishedStoryEvidence(story, completion, call, candidate))
            .claims.length > 0
        )
          claiming.push(candidate);
      }
      const [recovered] = claiming;
      if (claiming.length !== 1 || recovered === undefined)
        return unavailable(
          claiming.length > 1
            ? "Published claim history names multiple execution agents, so this completion cannot be attributed safely."
            : "The published completion record names no execution agent, and published execution claim history does not identify one.",
        );
      agent = recovered;
    }
    const evidence = await completedStoryCommits(
      story,
      completion,
      agent,
      call,
    );
    if ("explanation" in evidence) return unavailable(evidence.explanation);
    const less = await trunkLess(evidence.commits, completion, call);
    if (less === undefined)
      return unavailable(
        "This machine's Git cannot separate this story's published changes from other work.",
      );
    const tree = await git("rev-parse", `${completion}^{tree}`);
    // A resolved integration file includes both writers, regardless of whether
    // reversing single-parent story commits could otherwise hide that file.
    const mixed = new Map([...less.inseparable, ...evidence.resolutions]);
    return {
      kind: "published",
      completion,
      completedAt: String(record.completedAt),
      agent,
      remote: "origin",
      target: source.ref,
      baseline: less.tree,
      tree,
      files: await listedFrom(less.tree, tree, mixed, completion, call),
    };
  } catch (error) {
    return unavailable(
      `Published completion history could not be read: ${gitProblem(error)}`,
    );
  }
}
