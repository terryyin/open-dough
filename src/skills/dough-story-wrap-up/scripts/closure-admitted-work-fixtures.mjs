// Admitted-work closure fixtures: admission through the real startup CLI into
// a Trunk Mode workspace of its own, the real backlog `complete` CLI, a
// scripted stand-in for wrap-up's removal of one spent story section, one
// ordinary Trunk Mode closure, and observations of the remote tree's lists and
// agent profiles.
import assert from "node:assert/strict";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  listed,
  remoteText,
} from "../../dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { startCliResult } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { remoteProfileNames } from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { publishTrunkClosureRevision } from "./closure-publication.mjs";
import {
  createClosureObserver,
  git,
  lsRemoteSha,
  publishArgs,
} from "./closure-publication-fixtures.mjs";
const backlogFile = ".planning/PRODUCT-BACKLOG.md";
export const seedA = ".planning/seeds/A.md";
const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

// Admits accepted work from the originating checkout into its own Trunk Mode
// workspace through the real startup CLI.
export async function admit(trunk, name, args) {
  const { receipt, stdout, workspace, branch } = await startCliResult(
    trunk,
    "trunk",
    args,
    { name },
  );
  assert.equal(receipt.status, "published", stdout);
  return { workspace, branch, sha: receipt.publishedSha };
}

export const completeCli = (workspace, identity) =>
  exec(process.execPath, [
    backlogCli,
    ...["complete", "--identity", identity],
    ...["--file", join(workspace, backlogFile)],
  ]).catch((error) => error);

// A scripted stand-in for wrap-up's removal of one spent story section: from
// its anchor to the next story anchor, or to the end with the blank lines that
// separated it. Tests supply this edit, so it proves no product behavior.
export function withoutStory(source, anchor) {
  const start = source.indexOf(`<a id="${anchor}">`);
  const next = source.indexOf("<a id=", start + 1);
  if (next !== -1) return source.slice(0, start) + source.slice(next);
  return source.slice(0, start).replace(/\n+$/, "\n");
}

// Ordinary Trunk Mode closure from an owned workspace whose published base is
// `base`: publish the before-cleanup revision, apply `cleanup` to the
// workspace now on current trunk, complete the entry, then publish the final
// closure. `beforeFinal` lets another writer advance trunk in between.
export async function closeInTrunkMode(trunk, owned, base, identity, hooks) {
  const fixture = {
    execution: owned.workspace,
    integration: trunk.integration,
  };
  const observer = createClosureObserver(owned.workspace);
  const publish = (from) =>
    publishTrunkClosureRevision({
      ...publishArgs(fixture, observer, from),
      branch: owned.branch,
    });
  const before = await publish(base);
  assert.equal(before.ok, true, JSON.stringify(before));
  hooks.cleanup(owned.workspace);
  const completed = await completeCli(owned.workspace, identity);
  assert.equal(completed.code ?? 0, 0, completed.stderr);
  assert.match(completed.stdout, /Released agent profile agents\//);
  await git(owned.workspace, "add", "-A");
  await git(owned.workspace, "commit", "-qm", `Close ${identity}`);
  await hooks.beforeFinal?.();
  const final = await publish(before.receipt.sha);
  assert.equal(final.ok, true, JSON.stringify(final));
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(tip, final.receipt.sha);
  return { publish, tip, completed };
}

export const lists = async (trunk, rev) =>
  (await listed(trunk, rev)).map((entry) => [entry.list, entry.identity]);
export { remoteProfileNames };
export const profileOf = async (trunk, rev, identity) => {
  for (const path of await remoteProfileNames(trunk, rev)) {
    const profile = JSON.parse(await remoteText(trunk, rev, path));
    if (profile.identity === identity) return path;
  }
  return undefined;
};
