// Observes an admission native journey from remote Git state only: which
// work remote trunk holds in Taken, the claim commit that admitted it, its
// published story, preparation and plan, and the claims, profiles, story
// sections and entries that name it. Prints `field: value` lines for the assessor.
//
// Usage: node git-publication-native-admission-observe.mjs <source-dir>
//   <origin> <base-sha> <publisher> <workspace> [identity]
import { execFileSync } from "node:child_process";
import { dirname, join, posix } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, origin, base, publisher, workspace, wanted] =
  process.argv.slice(2);
const load = (path) => import(pathToFileURL(join(sourceDir, path)).href);
const scripts = "src/skills/dough-product-backlog/scripts";
const { parseBacklog, takenHeading } = await load(
  `${scripts}/product-backlog-document.mjs`,
);
const { splitHref } = await load(`${scripts}/product-backlog-identity.mjs`);
const { readStoryState } = await load(
  `${scripts}/product-backlog-story-state.mjs`,
);
const { claimProvenance } = await load(
  "src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs",
);

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const show = (rev, path) => {
  try {
    return execFileSync("git", ["show", `${rev}:${path}`], {
      cwd: origin,
      encoding: "utf8",
    });
  } catch {
    return null;
  }
};
const entriesAt = (rev) => parseBacklog(show(rev, backlogPath) ?? "").entries;

const tip = git(origin, "rev-parse", "refs/heads/main");
const taken = entriesAt(tip).filter((entry) => entry.list === takenHeading);
const entry = wanted
  ? taken.find((item) => item.identity === wanted)
  : taken.length === 1
    ? taken[0]
    : undefined;
const fields = {
  "remote-sha": tip,
  "base-sha": base,
  "taken-count": taken.length,
  identity: entry?.identity ?? "",
};

if (entry) {
  const { identity, href } = entry;
  const homePath = posix.join(dirname(backlogPath), splitHref(href).path);
  const claim = await claimProvenance(origin, "refs/heads/main", identity);
  const subject = claim?.sha
    ? git(origin, "log", "-1", "--format=%s", claim.sha)
    : "";
  const changed = claim?.sha
    ? git(origin, "show", "--name-only", "--format=", claim.sha).split("\n")
    : [];
  const home = show(tip, homePath) ?? "";
  let state;
  try {
    state = readStoryState(home, href);
    if (state.approach?.kind === "planned") {
      const plan = show(
        tip,
        posix.join(dirname(homePath), state.approach.plan),
      );
      state = readStoryState(home, href, { planSource: plan ?? "" });
    }
  } catch {
    state = undefined;
  }
  // The story's own plan, as the backlog would link it, and whether the
  // claim carried it and the backlog also lists it as work of its own.
  const planFile =
    state?.approach?.kind === "planned"
      ? posix.join(dirname(homePath), state.approach.plan)
      : "";
  const storyPlan = planFile
    ? posix.relative(dirname(backlogPath), planFile)
    : "";
  const anchor = splitHref(href).anchor;
  const log = git(origin, "log", "--format=%B", tip);
  const profiles = git(
    origin,
    "ls-tree",
    "--name-only",
    tip,
    ".planning/agents/",
  )
    .split("\n")
    .filter(Boolean)
    .filter((path) => {
      try {
        return JSON.parse(show(tip, path)).identity === identity;
      } catch {
        return false;
      }
    });
  Object.assign(fields, {
    "claim-owned": claim?.publisher === publisher,
    "claim-admitted": subject.startsWith("Admit accepted work:"),
    "claim-parent-unlisted": claim?.sha
      ? !entriesAt(`${claim.sha}^`).some((item) => item.identity === identity)
      : false,
    "story-in-claim": changed.includes(homePath),
    "claim-count": log.split(`Claim-Identity: ${identity}\n`).length - 1,
    "profile-count": profiles.length,
    "story-section-count": anchor
      ? home.split(`<a id="${anchor}">`).length - 1
      : 0,
    "story-plan": storyPlan,
    "entry-plan": entry.plan?.target ?? "",
    "plan-in-claim": Boolean(planFile) && changed.includes(planFile),
    "plan-home-count": storyPlan
      ? entriesAt(tip).filter((item) => item.href === storyPlan).length
      : 0,
    approach: state?.approach?.kind ?? "unrecorded",
    assessment: state?.assessment?.status ?? "unrecorded",
  });
}

// Product changes are anything outside planning records, on remote trunk
// since the base or in the owned workspace.
const remoteProduct = git(
  origin,
  "diff",
  "--name-only",
  base,
  tip,
  "--",
  ".",
  ":!.planning",
);
let workspaceProduct;
try {
  workspaceProduct = git(
    workspace,
    "status",
    "--porcelain",
    "--",
    ".",
    ":!.planning",
    ":!feature.txt",
  );
} catch {
  workspaceProduct = "";
}
fields["product-change"] = Boolean(remoteProduct || workspaceProduct);

for (const [key, value] of Object.entries(fields))
  process.stdout.write(`${key}: ${value}\n`);
