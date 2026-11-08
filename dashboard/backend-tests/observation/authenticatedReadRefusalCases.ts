// Parameter refusal catalogs for ./authenticated-read-refusal.spec.ts: listed
// records, branch reads, and watched branches that the boundary must refuse
// before launching `gh`.
import { agentIdentity } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const revision = "ab".repeat(20);

export const listedReadRefusals = [
  {
    listed: "an agent profile read",
    named: "agents=profiles",
    onlyPinned: "An agent profile read names only a pinned revision.",
    path: `.planning/${agentIdentity("Yui").path}`,
    combined: {
      read: "combined with a revision check",
      query: `revision=${revision}&since=${revision}`,
    },
    unpinnedRevision: "The pinned revision is not a commit sha.",
  },
  {
    listed: "a done catalog read",
    named: "done=catalog",
    onlyPinned: "A done catalog read names only a pinned revision.",
    path: ".planning/done/SEED-001_x.json",
    combined: {
      read: "combined with an agent profile read",
      query: `revision=${revision}&agents=profiles`,
    },
    unpinnedRevision: "The pinned revision is not a commit sha.",
  },
] as const;

export const branchReadRefusals = [
  {
    read: "whose branch name could reshape GitHub's endpoint",
    query: `revision=${revision}&branch=${encodeURIComponent("story/../../contents")}`,
    error: "The branch name is not usable.",
  },
  {
    read: "that names a file without the branch head",
    query: `revision=${revision}&branch=story%2Fexample&path=${encodeURIComponent(".planning/slice-plans/092/PLAN.md")}`,
    error: "A read on a branch names the branch head it resolved.",
  },
  {
    read: "at a head that is not a commit sha",
    query: `revision=${revision}&branch=story%2Fexample&head=main&path=${encodeURIComponent(".planning/slice-plans/092/PLAN.md")}`,
    error: "The branch head is not a commit sha.",
  },
  {
    read: "combined with a revision check",
    query: `since=${revision}&branch=story%2Fexample`,
    error:
      "A branch read names only a pinned revision, a recorded branch, and for a file its resolved head and repository path.",
  },
] as const;

const onlyWithCheck = "Watched branches are named only with a revision check.";

export const watchedBranchRefusals = [
  {
    read: "whose branch name could reshape what it names",
    query: `since=${revision}&watch=${encodeURIComponent("story/../main")}`,
    error: "A watched branch name is not usable.",
  },
  {
    read: "among too many",
    query: `since=${revision}${Array.from(
      Array(101).keys(),
      (at) => `&watch=story%2F${String(at)}`,
    ).join("")}`,
    error: "A revision check watches too many branches.",
  },
  {
    read: "without a revision check",
    query: `watch=story%2Fexample`,
    error: onlyWithCheck,
  },
  {
    read: "beside a pinned revision",
    query: `since=${revision}&revision=${revision}&watch=story%2Fexample`,
    error: onlyWithCheck,
  },
  {
    read: "beside a branch read",
    query: `since=${revision}&branch=story%2Fexample&watch=story%2Fexample`,
    error: onlyWithCheck,
  },
] as const;
