// What a story result answers from its admitted tree: the named comparison
// pins the revision, and the tree's files and Intent settings shape the read.
import { agentSettingsPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { locationSelectsRepositoryPath } from "../src/intentLocationSelection.ts";
import type { StoryReviewResult } from "../src/storyReviewResult.ts";
import { gitProblem } from "./gitRunner.ts";
import type { SideRead } from "./gitTreeFiles.ts";
import {
  declaredLocations,
  intentLocationAnswer,
} from "./intentLocationsSettings.ts";
import { RefusedRequest } from "./localOrigin.ts";

export type NamedComparison =
  | {
      readonly kind: "published";
      readonly tree: string;
      readonly completion: string;
    }
  | {
      readonly kind: "published-taken";
      readonly tree: string;
      readonly head: string;
    }
  | {
      readonly kind: "landed";
      readonly tree: string;
      readonly landing: { readonly revision: string };
    };

// The revision whose files a read of `tree` returns, when `tree` is the
// comparison's own.
export function resultRevision(comparison: NamedComparison, tree: string) {
  if (comparison.tree !== tree)
    throw new RefusedRequest(
      409,
      "The result tree does not belong to this published comparison.",
    );
  return comparison.kind === "published"
    ? comparison.completion
    : comparison.kind === "published-taken"
      ? comparison.head
      : comparison.landing.revision;
}

// One admitted tree's files at `revision`; `paths` throws when the tree
// cannot be listed.
export type ResultTree = {
  readonly revision: string;
  readonly paths: () => Promise<string[]>;
  readonly text: (path: string) => Promise<SideRead>;
};

export async function resultAnswer(
  tree: ResultTree,
  path?: string,
): Promise<StoryReviewResult> {
  const { revision } = tree;
  if (path !== undefined) return { ...(await tree.text(path)), revision, path };

  let paths: string[];
  try {
    paths = await tree.paths();
  } catch (error) {
    return {
      kind: "unavailable",
      revision,
      explanation: `The result tree could not be listed: ${gitProblem(error)}`,
    };
  }
  const inventory = { kind: "inventory" as const, revision, paths };
  const settings = await tree.text(agentSettingsPath);
  if (settings.kind === "absent") return { ...inventory, locations: null };
  if (settings.kind === "unavailable")
    return { ...inventory, locations: null, settingsProblem: "unreadable" };
  const declared = declaredLocations(settings.text);
  if (declared.kind === "malformed")
    return { ...inventory, locations: null, settingsProblem: "malformed" };
  if (declared.kind === "absent") return { ...inventory, locations: null };
  return {
    ...inventory,
    locations: declared.locations.map((location) =>
      intentLocationAnswer(
        location,
        paths.filter((file) => locationSelectsRepositoryPath(file, location)),
      ),
    ),
  };
}
