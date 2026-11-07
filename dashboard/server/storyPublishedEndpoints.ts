// Shared published-story endpoint facts for Review changes and a story's CI
// comparison: one history walk recovers the completion, claims, owning
// landing merge, recorded mode and story-start bound. Endpoint recovery uses
// claim history without merge-resolution attribution; Review continues with
// attribution for commits and resolutions, while comparison looks up builds
// at these revisions.
import path from "node:path";
import { realpath } from "node:fs/promises";
import {
  doneRecordFileName,
  parseDoneRecordFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  agentProfileDirectoryOf,
  doneRecordDirectoryOf,
} from "./recordsBesideBacklog.ts";
import {
  completedStoryClaimEvidence,
  type CompletedStoryClaimEvidence,
} from "./storyCompletedCommits.ts";
import {
  landingOf,
  recordedExecution,
  type StoryExecutionMode,
} from "./storyPublishedEndpointDerived.ts";
import {
  publishedStoryAgents,
  publishedStoryEvidence,
} from "./storyPublishedEvidence.ts";

export type { StoryExecutionMode };

// Fixed revisions a story's CI comparison (and Review) derives once from
// published history: the completion, the story-start bound (octopus base of
// the claims' parents), recorded mode, and for Story Branch Mode the landing
// from the story's own history (trunk-first merge or fast-forward tip) with
// its branch side. Commits and resolutions stay with attribution in Review,
// not here.
export type PublishedStoryEndpointFacts = {
  readonly identity: string;
  readonly completion: string;
  readonly completedAt: string;
  readonly agent: string;
  readonly mode: StoryExecutionMode;
  readonly branch?: string;
  // Newest first-parent trunk revision at or before the claim parents'
  // octopus base — the bound for baseline and result ancestor walks.
  readonly storyStart: string;
  readonly claims: readonly string[];
  // Story Branch landing: trunk-first owning merge and story-side parent, or
  // the fast-forward tip as both slots; absent for Trunk Mode and when
  // published history names no identifiable landing.
  readonly landing?: {
    readonly merge: string;
    readonly branchSide: string;
  };
};

// Successful recovery keeps the claim walk beside endpoint facts so Review
// can attribute commits and resolutions without recovering claims again.
// Comparison consumers read only `facts`.
export type PublishedStoryEndpoints =
  | {
      readonly kind: "facts";
      readonly facts: PublishedStoryEndpointFacts;
      readonly claim: CompletedStoryClaimEvidence;
    }
  | { readonly kind: "unavailable"; readonly explanation: string }
  | { readonly kind: "absent" };

// One shared walk of published done/profile history for `identity` of
// `source`. `namedCompletion` pins a known completion when Review already
// has one; otherwise the walk fetches origin and fixes the completion from
// path history.
export async function publishedStoryEndpoints(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedCompletion?: string,
): Promise<PublishedStoryEndpoints> {
  const directory = projectFolder(source).path;
  const call: GitCall = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
  const git = async (...args: string[]) =>
    (await runGit(args, call)).stdout.trim();
  try {
    if (
      (await realpath(await git("rev-parse", "--show-toplevel"))) !==
      (await realpath(directory))
    )
      return {
        kind: "unavailable",
        explanation:
          "The configured project folder is no longer this project's Git checkout.",
      };
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
    if (listed !== file) return { kind: "absent" };
    const read = parseDoneRecordFile(
      fileName,
      await git("show", `${at}:${file}`),
    );
    const record = read.record;
    if (!read.ok || record === undefined || record.identity !== identity)
      return {
        kind: "unavailable",
        explanation:
          "The published completion record is unreadable or names another story.",
      };
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
      return {
        kind: "unavailable",
        explanation: "Published history is missing the completion revision.",
      };
    if (namedCompletion !== undefined && namedCompletion !== completion)
      return {
        kind: "unavailable",
        explanation: "This revision is not the story's published completion.",
      };
    const story = {
      identity,
      profileDirectory: agentProfileDirectoryOf(source),
    };
    const recordedAgent: unknown = record.agent;
    let agent = typeof recordedAgent === "string" ? recordedAgent : undefined;
    if (agent === undefined) {
      if ((await git("rev-parse", "--is-shallow-repository")) === "true")
        return {
          kind: "unavailable",
          explanation:
            "Published execution claim history is shallow, so a unique execution agent cannot be recovered safely.",
        };
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
        return {
          kind: "unavailable",
          explanation:
            claiming.length > 1
              ? "Published claim history names multiple execution agents, so this completion cannot be attributed safely."
              : "The published completion record names no execution agent, and published execution claim history does not identify one.",
        };
      agent = recovered;
    }
    const evidence = await completedStoryClaimEvidence(
      story,
      completion,
      agent,
      call,
    );
    if ("explanation" in evidence)
      return { kind: "unavailable", explanation: evidence.explanation };
    const [firstClaim] = evidence.claims;
    if (firstClaim === undefined)
      return {
        kind: "unavailable",
        explanation:
          "Published execution history does not establish a complete claim and its attributed commits for this completion.",
      };
    const execution = await recordedExecution(story, firstClaim, agent, call);
    if (execution === undefined)
      return {
        kind: "unavailable",
        explanation:
          "Published execution claim history does not record a usable execution mode for this completion.",
      };
    const landing =
      execution.mode === "story-branch"
        ? await landingOf(
            completion,
            evidence.storyStart,
            evidence.owningMerges,
            evidence.commits.map((commit) => commit.commit),
            call,
          )
        : undefined;
    return {
      kind: "facts",
      facts: {
        identity,
        completion,
        completedAt: String(record.completedAt),
        agent,
        ...execution,
        storyStart: evidence.storyStart,
        claims: evidence.claims,
        ...(landing === undefined ? {} : { landing }),
      },
      claim: evidence,
    };
  } catch (error) {
    if (signal.aborted) throw error;
    return {
      kind: "unavailable",
      explanation: `Published completion history could not be read: ${gitProblem(error)}`,
    };
  }
}
