// Derives which published Done story a retained ad hoc session completed.
// Join the launch reporting reference to Claim-Publisher / Claim-Identity and
// the launch-bound accepted capture to recovered completion. Rebuildable only;
// never a competing persisted completion fact or retroactive execution request.
import { trailers } from "../../Distribution/src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { landingCompletesStory } from "./completedStoryCapture.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import {
  runGit,
  gitProblem,
  defaultGitOutputLimit,
  type GitCall,
} from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";

export type CompletedStoryAssociation =
  | { readonly kind: "linked"; readonly identity: string }
  | { readonly kind: "absent" }
  | { readonly kind: "unavailable"; readonly explanation: string };

// Claims in published history whose Claim-Publisher exactly names `publisher`.
async function identitiesClaimedBy(
  publisher: string,
  at: string,
  call: GitCall,
): Promise<
  | { readonly kind: "identities"; readonly identities: readonly string[] }
  | { readonly kind: "unavailable"; readonly explanation: string }
> {
  try {
    const printed = (
      await runGit(
        [
          "log",
          "--format=%H%x00%B%x00",
          "--grep",
          `Claim-Publisher: ${publisher}`,
          "--fixed-strings",
          at,
        ],
        call,
      )
    ).stdout;
    const identities = new Set<string>();
    const parts = printed.split("\0").filter((part) => part !== "");
    for (let index = 0; index + 1 < parts.length; index += 2) {
      const message = parts[index + 1] ?? "";
      const owned = trailers(message);
      if (
        owned.publisher !== publisher ||
        typeof owned.identity !== "string" ||
        owned.identity === ""
      )
        continue;
      identities.add(owned.identity);
    }
    return { kind: "identities", identities: [...identities] };
  } catch (error) {
    if (call.signal?.aborted === true) throw error;
    return {
      kind: "unavailable",
      explanation: `Published claim history could not be read: ${gitProblem(error)}`,
    };
  }
}

// Unique completed story for a retained launch, or absence / unreadability.
export async function completedStoryAssociation(
  source: PublishedSource,
  record: LaunchRecord,
  signal: AbortSignal,
): Promise<CompletedStoryAssociation> {
  if (record.request.source !== source.id) return { kind: "absent" };
  const reference = record.request.reporting?.reference;
  const landing = record.landing;
  const established = record.establishedSession ?? record.start;
  if (
    reference === undefined ||
    landing === undefined ||
    established === undefined ||
    landing.reference !== reference
  )
    return { kind: "absent" };
  try {
    const directory = projectFolder(source).path;
    const call = { signal, maxBuffer: defaultGitOutputLimit };
    if (
      (await commonGitDirectory({ ...call, cwd: landing.repository })) !==
      (await commonGitDirectory({ ...call, cwd: directory }))
    )
      return { kind: "absent" };
  } catch (error) {
    if (signal.aborted) throw error;
    return {
      kind: "unavailable",
      explanation: `The captured landing repository could not be checked: ${gitProblem(error)}`,
    };
  }
  const call: GitCall = {
    cwd: landing.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  const claimed = await identitiesClaimedBy(reference, landing.revision, call);
  if (claimed.kind === "unavailable") return claimed;
  if (claimed.identities.length === 0) return { kind: "absent" };
  const matched: string[] = [];
  let unread = false;
  const unreadExplanation =
    "Published completion history could not be checked for every candidate story.";
  for (const identity of claimed.identities) {
    signal.throwIfAborted();
    const match = await landingCompletesStory(
      source,
      identity,
      landing,
      established,
      signal,
      { identityOptional: true, publisher: reference },
    );
    if (match === "matched") matched.push(identity);
    else if (match === "unavailable") unread = true;
  }
  if (matched.length === 1 && !unread) {
    const [identity] = matched;
    if (identity === undefined) return { kind: "absent" };
    return { kind: "linked", identity };
  }
  if (unread) return { kind: "unavailable", explanation: unreadExplanation };
  return { kind: "absent" };
}
