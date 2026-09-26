// Published queued source and local unpublished selected-source checks.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { readHome } from "../../dough-product-backlog/scripts/product-backlog-home-reader.mjs";
import { readStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { git } from "./publication-git.mjs";
import { backlogPath } from "./workspace-publication-ownership.mjs";

async function show(cwd, rev, path) {
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

function selectedRegion(source, href) {
  if (source === null) return null;
  const home = readHome(source, href);
  const lines = home.document.lines.slice(home.region.start, home.region.end);
  // A sibling section may add separator lines at this boundary. Preserve
  // whitespace within the selected section, including trailing spaces on text.
  while (lines.at(-1) === "") lines.pop();
  return lines.join("\n");
}

// `git cat-file --batch` output for `names`, as raw bytes.
function catFileBatch(cwd, names) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["cat-file", "--batch"], { cwd });
    const chunks = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.resume();
    child.stdin.on("error", () => {});
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(Buffer.concat(chunks))
        : reject(new Error(`git cat-file --batch exited ${code}`)),
    );
    child.stdin.end(names.map((name) => `${name}\n`).join(""));
  });
}

// Blobs this small print identically through `git show`, far below its
// output limit.
const batchedBlobLimit = 256 * 1024;

// The contents of `rev:path` for each name, as `show` returns them. One
// batch answers each small blob; any other answer is read by `git show`.
async function showAll(cwd, names) {
  const results = names.map(() => undefined);
  if (!names.some((name) => name.includes("\n"))) {
    try {
      const output = await catFileBatch(cwd, names);
      let offset = 0;
      for (const [index, name] of names.entries()) {
        const end = output.indexOf(0x0a, offset);
        if (end < 0) throw new Error("truncated cat-file output");
        const header = output.toString("utf8", offset, end);
        offset = end + 1;
        if (header === `${name} missing` || header === `${name} ambiguous`)
          continue;
        const [, type, size] = header.split(" ");
        const length = Number(size);
        if (!/^\d+$/.test(size ?? "")) throw new Error("unexpected header");
        if (type === "blob" && length <= batchedBlobLimit)
          results[index] = output.toString("utf8", offset, offset + length);
        offset += length + 1;
      }
    } catch {
      results.fill(undefined);
    }
  }
  return Promise.all(
    names.map((name, index) => {
      if (results[index] !== undefined) return results[index];
      const split = name.indexOf(":");
      return show(cwd, name.slice(0, split), name.slice(split + 1));
    }),
  );
}

// Whether the selected part of each source (its `href` region, or the whole
// file) differs between the merge base with fetched trunk, HEAD, the index,
// and the working tree, answered in order.
async function unpublishedSources(integration, remoteRef, sources) {
  const base = (
    await git(integration, "merge-base", "HEAD", remoteRef)
  ).stdout.trim();
  const revs = [base, "HEAD", ""];
  const read = await showAll(
    integration,
    sources.flatMap(({ path }) => revs.map((rev) => `${rev}:${path}`)),
  );
  return sources.map(({ path, href }, position) => {
    let worktree;
    try {
      worktree = readFileSync(join(integration, path), "utf8");
    } catch {
      worktree = null;
    }
    const versions = [...read.slice(position * 3, position * 3 + 3), worktree];
    const selected = versions.map((source) =>
      href ? selectedRegion(source, href) : source,
    );
    return selected.some(
      (value, index) => index > 0 && value !== selected[index - 1],
    );
  });
}

export async function readPublishedExecutionSource(request, remoteRef) {
  const backlog = await show(request.integration, remoteRef, backlogPath);
  if (backlog === null) throw new Error("fetched trunk has no product backlog");
  const entry = parseBacklog(backlog).entries.find(
    (item) => item.identity === request.identity,
  );
  if (
    !entry ||
    (entry.list !== queueHeading &&
      !(request.retained && entry.list === takenHeading))
  )
    throw new Error("selected identity is not queued on fetched trunk");
  const backlogDir = dirname(backlogPath);
  const homePath = within(
    request.integration,
    posix.join(backlogDir, entry.href.split("#")[0]),
  );
  const home = await show(request.integration, remoteRef, homePath);
  if (home === null)
    throw new Error("selected canonical home is absent on fetched trunk");
  const preview = readStoryState(home, entry.href);
  if (preview.identity !== request.identity || preview.status !== "recorded")
    throw new Error("selected canonical preparation or identity is unresolved");
  let planPath, plan, planTarget;
  if (preview.approach.kind === "planned") {
    planPath = within(
      request.integration,
      posix.join(dirname(homePath), preview.approach.plan),
    );
    plan = await show(request.integration, remoteRef, planPath);
    if (plan === null) throw new Error("published plan is absent");
    const planHref = posix.relative(backlogDir, planPath);
    // Take refuses a plan link naming the entry's own href as a duplicate.
    if (planHref !== entry.href) planTarget = planHref;
    if (entry.plan && entry.plan.target !== planTarget)
      throw new Error("queued plan link disagrees with preparation");
    if (request.plan && request.plan !== planHref)
      throw new Error("requested plan disagrees with published preparation");
  } else if (
    preview.approach.kind !== "planless" ||
    request.plan ||
    entry.plan
  ) {
    throw new Error("queued planless authority or plan link is inconsistent");
  }
  const preparation = readStoryState(
    home,
    entry.href,
    planPath ? { planSource: plan } : {},
  );
  if (preparation.assessment.status !== "ready")
    throw new Error(
      `published preparation is ${preparation.assessment.status}`,
    );
  const [storyChanged, planChanged] = await unpublishedSources(
    request.integration,
    remoteRef,
    [
      { path: homePath, href: entry.href },
      ...(planPath ? [{ path: planPath, href: null }] : []),
    ],
  );
  if (storyChanged)
    throw new Error(
      "unpublished selected story source in originating checkout",
    );
  if (planChanged)
    throw new Error("unpublished selected plan in originating checkout");
  return {
    entry,
    homePath,
    planPath,
    planTarget,
    preparation,
    selectedSource: selectedRegion(home, entry.href),
    planSource: plan,
  };
}
