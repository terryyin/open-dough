// Published queued or continued Taken source, the selected story's section and
// declared plan shared with admission, and local unpublished selected-source
// checks.
import { readFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { readHome } from "../../dough-product-backlog/scripts/product-backlog-home-reader.mjs";
import { splitHref } from "../../dough-product-backlog/scripts/product-backlog-identity.mjs";
import { readStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { BacklogError } from "../../dough-product-backlog/scripts/product-backlog-refusal.mjs";
import { git } from "./publication-git.mjs";
import {
  backlogPath,
  claimProvenance,
} from "./workspace-publication-ownership.mjs";

export async function show(cwd, rev, path) {
  try {
    return (await git(cwd, "show", `${rev}:${path}`)).stdout;
  } catch {
    return null;
  }
}

function within(root, path) {
  const project = resolve(root);
  const absolute = resolve(project, path);
  if (absolute !== project && !absolute.startsWith(project + sep))
    throw new Error(`source path escapes project: ${path}`);
  return relative(project, absolute).split(sep).join("/");
}

// The selected story's section of `source`, or undefined when `source` has
// none: its document, its region, and its text without the separator lines a
// following sibling section may add. Whitespace within the section, including
// trailing spaces on text, is kept.
export function sectionOf(source, href) {
  if (source === null) return undefined;
  let home;
  try {
    home = readHome(source, href);
  } catch (error) {
    if (error instanceof BacklogError) return undefined;
    throw error;
  }
  const { document, region } = home;
  const lines = document.lines.slice(region.start, region.end);
  while (lines.at(-1) === "") lines.pop();
  return { document, region, text: lines.join("\n") };
}

// The originating checkout's working-tree copy, or null when it has none.
export function worktreeSource(root, path) {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch {
    return null;
  }
}

export async function mergeBase(integration, remoteRef) {
  return (
    await git(integration, "merge-base", "HEAD", remoteRef)
  ).stdout.trim();
}

// Where the selected story's preparation lives and what it declares. The
// canonical home's project path follows its backlog link; `declaredPlan`
// resolves the plan a recorded approach names, relative to that home. A plan
// whose path is the home itself is canonical: it is read and digested as the
// home, and a Taken entry never links it. Any other plan is its own file,
// linked by `planTarget`. `read` reads the preparation recorded in a home's
// text, digesting the declared plan's `planSource` when one is given.
export function selectedPreparation(integration, href) {
  const homePath = within(
    integration,
    posix.join(dirname(backlogPath), splitHref(href).path),
  );
  return {
    homePath,
    declaredPlan(approach) {
      if (approach.kind !== "planned") return {};
      const planPath = within(
        integration,
        posix.join(dirname(homePath), approach.plan),
      );
      const planHref = posix.relative(dirname(backlogPath), planPath);
      if (planPath === homePath)
        return { planPath, planHref, planIsCanonical: true };
      return { planPath, planHref, planTarget: planHref };
    },
    read(source, { planIsCanonical } = {}, planSource) {
      return readStoryState(source, href, { planIsCanonical, planSource });
    },
  };
}

// A version of the selected source to compare: a missing file, the whole
// file, or the selected story's section (undefined when the file lacks it).
function versionOf(source, href) {
  if (source === null || !href) return source;
  return sectionOf(source, href)?.text;
}

// Whether the originating checkout's HEAD, index or worktree holds a version
// of the selected source that was never published: one matching neither its
// merge base, fetched trunk, nor a `published` revision such as the claim
// that admitted it and left its draft there.
async function unpublishedSource(
  integration,
  remoteRef,
  path,
  href,
  published,
) {
  const base = await mergeBase(integration, remoteRef);
  const known = new Set();
  for (const rev of [base, remoteRef, ...published])
    known.add(versionOf(await show(integration, rev, path), href));
  const local = [
    await show(integration, "HEAD", path),
    await show(integration, "", path),
    worktreeSource(integration, path),
  ];
  return local.some((source) => !known.has(versionOf(source, href)));
}

export async function readPublishedExecutionSource(request, remoteRef) {
  const backlog = await show(request.integration, remoteRef, backlogPath);
  if (backlog === null) throw new Error("fetched trunk has no product backlog");
  const entry = parseBacklog(backlog).entries.find(
    (item) => item.identity === request.identity,
  );
  if (!entry || (entry.list !== queueHeading && entry.list !== takenHeading))
    throw new Error("selected identity is not queued on fetched trunk");
  // Outside claim recovery, Taken work is a continuation: only the claim's
  // own publisher continues it, and only from ready published preparation.
  let claim;
  if (entry.list === takenHeading && !request.retained) {
    claim = await claimProvenance(
      request.integration,
      remoteRef,
      request.identity,
      backlogPath,
    );
    if (!claim?.publisher || claim.publisher !== request.publisherId)
      return { existing: entry, claim };
  }
  const selection = selectedPreparation(request.integration, entry.href);
  const { homePath } = selection;
  const home = await show(request.integration, remoteRef, homePath);
  if (home === null)
    throw new Error("selected canonical home is absent on fetched trunk");
  const preview = selection.read(home);
  if (preview.identity !== request.identity || preview.status !== "recorded")
    throw new Error("selected canonical preparation or identity is unresolved");
  const declaredPlan = selection.declaredPlan(preview.approach);
  const { planPath, planHref, planTarget, planIsCanonical } = declaredPlan;
  let plan;
  if (preview.approach.kind === "planned") {
    if (!planIsCanonical) {
      plan = await show(request.integration, remoteRef, planPath);
      if (plan === null) throw new Error("published plan is absent");
    }
    if (entry.plan && entry.plan.target !== planTarget)
      throw new Error("queued plan link disagrees with preparation");
    if (request.plan && request.plan !== planHref)
      throw new Error("requested plan disagrees with published preparation");
  } else if (preview.approach.kind === "unselected") {
    throw new Error("published approach is unselected");
  } else if (
    preview.approach.kind !== "planless" ||
    request.plan ||
    entry.plan
  ) {
    throw new Error("queued planless authority or plan link is inconsistent");
  }
  const preparation = selection.read(home, declaredPlan, plan);
  if (preparation.assessment.status !== "ready")
    throw new Error(
      `published preparation is ${preparation.assessment.status}`,
    );
  const published = claim ? [claim.sha] : [];
  if (
    await unpublishedSource(
      request.integration,
      remoteRef,
      homePath,
      entry.href,
      published,
    )
  )
    throw new Error(
      "unpublished selected story source in originating checkout",
    );
  if (
    plan !== undefined &&
    (await unpublishedSource(
      request.integration,
      remoteRef,
      planPath,
      null,
      published,
    ))
  )
    throw new Error("unpublished selected plan in originating checkout");
  return {
    ...(claim ? { existing: entry, claim } : {}),
    entry,
    homePath,
    planPath,
    planTarget,
    preparation,
    selectedSource: sectionOf(home, entry.href).text,
    planSource: plan,
  };
}
