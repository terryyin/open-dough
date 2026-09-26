// Admission fixtures: drafted seed stories with recorded preparation facts,
// the admission CLI arguments, and observations of what remote trunk
// published. Shared by the admission journey and refusal tests.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
import { parseBacklog } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { recordStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";

const backlogFile = ".planning/PRODUCT-BACKLOG.md";

export function storySection(anchor, identity, title, goal) {
  return `<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n**Goal:** ${goal}\n`;
}

// Records preparation facts only, as the record-state operation does; no
// assessment is recorded.
export function withFacts(source, href, identity, approach, plan) {
  return recordStoryState(
    source,
    {
      href,
      identity,
      refinement: "refined",
      approach,
      ...(plan ? { plan } : {}),
    },
    plan ? { planSource: "" } : {},
  ).source;
}

export function writeDraft(trunk, path, text) {
  mkdirSync(join(trunk.integration, path, ".."), { recursive: true });
  writeFileSync(join(trunk.integration, path), text);
}

export function admitArgs(identity, link, title, ...extra) {
  return [
    "--admit",
    "--identity",
    identity,
    "--link",
    link,
    "--title",
    title,
    "--host",
    "claude",
    "--model",
    "claude-opus-5-5",
    ...extra,
  ];
}

export async function remoteText(trunk, rev, path) {
  try {
    return (await git(trunk.origin, "show", `${rev}:${path}`)).stdout;
  } catch {
    return null;
  }
}

export async function listed(trunk, rev) {
  return parseBacklog(await remoteText(trunk, rev, backlogFile)).entries;
}

// Every first-parent commit up to `rev` either omits the identity or holds
// it in Taken: the work was never published as queue-only.
export async function neverQueued(trunk, rev, identity) {
  const shas = (
    await git(trunk.origin, "rev-list", "--first-parent", rev)
  ).stdout
    .trim()
    .split("\n");
  for (const sha of shas) {
    const entry = (await listed(trunk, sha)).find(
      (item) => item.identity === identity,
    );
    assert.notEqual(entry?.list, "Backlog list", `${sha} queued ${identity}`);
  }
}

export async function changedPaths(trunk, sha) {
  return (
    await git(trunk.origin, "show", "--name-status", "--format=", sha)
  ).stdout
    .trim()
    .split("\n")
    .sort();
}

// A clone that publishes trunk changes the originating checkout never fetched.
export async function pushFromElsewhere(trunk, path, edit) {
  const other = join(trunk.fixture, "elsewhere");
  if (!existsSync(other)) {
    await exec("git", ["clone", "-q", trunk.origin, other]);
    await git(other, "config", "user.name", "Elsewhere");
    await git(other, "config", "user.email", "elsewhere@example.test");
  }
  await git(other, "pull", "-q", "origin", "main");
  writeFileSync(
    join(other, path),
    edit(readFileSync(join(other, path), "utf8")),
  );
  await git(other, "commit", "-qam", `elsewhere edits ${path}`);
  await git(other, "push", "-q", "origin", "HEAD:main");
  return revParse(other, "HEAD");
}
