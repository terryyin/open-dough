// A start request can carry a draft before there is an originating draft
// checkout. Admission still reads and publishes it through the ordinary Take.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  defaultSeedDirectory,
  readIdentityEvidence,
} from "../../dough-product-backlog/scripts/product-backlog-identity-evidence.mjs";
import { doneCatalogPath } from "../../dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { doneRecordDirectory } from "../../dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { seedNumberOf } from "../../dough-product-backlog/scripts/product-backlog-identity-sources.mjs";
import { composeIdentity } from "../../dough-product-backlog/scripts/product-backlog-identity.mjs";
import { recordStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { renderEntry } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { refused } from "./execution-admission-reconcile.mjs";
import { show } from "./execution-source.mjs";
import { git, revParse } from "./publication-git.mjs";
import {
  backlogPath,
  isAncestor,
  remoteOf,
  remoteRef,
  sourceStopped,
  stopped,
} from "./workspace-publication-ownership.mjs";

const anchor = "ad-hoc-work";
const identityPaths = [
  backlogPath,
  ...[defaultSeedDirectory, doneRecordDirectory, doneCatalogPath].map(
    (path) => `${dirname(backlogPath)}/${path}`,
  ),
];
const documentOf = (seed) => `seeds/${seed}-${anchor}.md`;
const oneLine = (value) =>
  typeof value === "string" && value.trim() !== "" && !/[\r\n]/.test(value);

// Identity evidence reads a checkout and its HEAD. Give it only the published
// planning files in a disposable, detached checkout of the exact revision.
// Neither the admission workspace nor the later session's checkout supplies
// draft evidence, and their working trees, indexes and HEADs stay untouched.
async function publishedEvidence(repository, revision, identity) {
  const directory = await mkdtemp(join(tmpdir(), "dough-identity-"));
  const snapshot = join(directory, "snapshot");
  try {
    const { stdout } = await git(
      repository,
      "ls-tree",
      "--name-only",
      "-z",
      revision,
      "--",
      ...identityPaths,
    );
    const paths = stdout.split("\0").filter(Boolean);
    if (!paths.includes(backlogPath))
      throw refused("fetched trunk has no product backlog");
    await git(
      repository,
      "worktree",
      "add",
      "--detach",
      "--no-checkout",
      snapshot,
      revision,
    );
    try {
      await git(
        snapshot,
        "restore",
        `--source=${revision}`,
        "--staged",
        "--worktree",
        "--",
        ...paths,
      );
      const evidence = await readIdentityEvidence(join(snapshot, backlogPath), {
        identity,
        includeSeedUse: true,
      });
      if (evidence.gaps.length > 0)
        throw refused(
          `identity evidence is incomplete: ${evidence.gaps.map(({ path, reason }) => `${path}: ${reason}`).join(", ")}`,
        );
      return evidence;
    } finally {
      await git(repository, "worktree", "remove", "--force", snapshot);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

// Select the first available seed from the workflow's published evidence.
// The caller retains these coordinates before requesting any publication.
export async function draftAdmission(request) {
  if (
    !request.repository ||
    !request.target ||
    !oneLine(request.title) ||
    !oneLine(request.goal)
  )
    return stopped("invalid-request", {
      error: "draft requires repository, target, and a one-line title and goal",
    });
  const { repository, title, goal } = request;
  try {
    await git(repository, "fetch", remoteOf(request));
    const basis = await revParse(repository, remoteRef(request));
    const evidence = await publishedEvidence(repository, basis);
    const seed = evidence.next ?? "SEED-001";
    const identity = composeIdentity(seed, anchor);
    const link = `${documentOf(seed)}#${anchor}`;
    renderEntry({ identity, href: link, title });
    return {
      ok: true,
      status: "drafted",
      identity,
      link,
      title,
      ownedDraft: { basis, goal },
    };
  } catch (error) {
    return sourceStopped(error, { error: error.stderr || error.message });
  }
}

export function parseOwnedDraft(input) {
  let draft;
  try {
    draft = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    return undefined;
  }
  return /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(draft?.basis) &&
    oneLine(draft.goal)
    ? { basis: draft.basis, goal: draft.goal }
    : undefined;
}

export async function readOwnedAdmissionText(request, homePath, candidate) {
  const { repository, identity, link, title, ownedDraft } = request;
  const seed = seedNumberOf(identity);
  if (
    !seed ||
    !/^[\w-]+$/.test(seed.seed) ||
    identity !== composeIdentity(seed.seed, anchor) ||
    link !== `${documentOf(seed.seed)}#${anchor}` ||
    !oneLine(title)
  )
    throw refused(
      "owned draft does not name a canonical new seed and one-line title",
    );
  renderEntry({ identity, href: link, title });
  const source = `---\nid: ${seed.seed}\nstatus: active\nscope: one story\n---\n\n# ${seed.seed} — ${title}\n\n<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n**Goal:** ${ownedDraft.goal}\n`;
  const { source: content } = recordStoryState(source, {
    href: link,
    identity,
    refinement: "not-refined",
    approach: "unselected",
  });
  if (candidate && (await show(repository, candidate, homePath)) !== content)
    throw refused(
      "owned draft disagrees with the retained admission candidate",
    );
  return content;
}

export async function ownedAdmissionDrafts(request, ref, homePath, content) {
  const {
    repository,
    identity,
    ownedDraft: { basis },
  } = request;
  const trunk = await revParse(repository, ref);
  if (!(await isAncestor(repository, basis, trunk)))
    throw refused("owned draft basis is not on fetched trunk");
  const original = await publishedEvidence(repository, basis, identity);
  const published =
    trunk === basis
      ? original
      : await publishedEvidence(repository, trunk, identity);
  if (
    seedNumberOf(identity).number <= (original.highest?.number ?? 0) ||
    published.seedInUse
  )
    throw refused(
      `owned draft identity ${identity} has already been used or is below its allocated range`,
    );
  return { base: basis, read: (path) => (path === homePath ? content : null) };
}
