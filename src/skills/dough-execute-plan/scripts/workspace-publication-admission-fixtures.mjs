// Admission fixtures: drafted seed stories with recorded preparation facts,
// the admission CLI arguments, the ordinary preparation published later for
// an admitted story, and observations of what remote trunk published. Shared
// by the admission journey, refusal and continuation tests and the native
// admission harness.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
import { parseBacklog } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { recordStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";

const backlogFile = ".planning/PRODUCT-BACKLOG.md";
const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

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

// Ordinary preparation of an admitted story's implementation, kept from a
// preparation clone of its own: writes `plan` at the story's declared
// `planHref`, records it with the real record-state operation, adds a ready
// assessment when `ready`, and publishes that keep to remote trunk. Returns
// the published SHA.
export async function publishPlannedPreparation(
  trunk,
  { identity, link, planHref },
  { plan, ready = false },
) {
  const clone = join(trunk.fixture, "preparation");
  if (existsSync(clone)) await git(clone, "pull", "-q", "origin", "main");
  else {
    await exec("git", ["clone", "-q", trunk.origin, clone]);
    await git(clone, "config", "user.name", "Preparation");
    await git(clone, "config", "user.email", "preparation@example.test");
  }
  const home = posix.join(".planning", link.split("#")[0]);
  const planFile = join(clone, posix.join(posix.dirname(home), planHref));
  mkdirSync(dirname(planFile), { recursive: true });
  writeFileSync(planFile, plan);
  const record = async (...args) =>
    (
      await exec(process.execPath, [
        backlogCli,
        ...args,
        "--file",
        join(clone, backlogFile),
      ])
    ).stdout;
  const planned = [
    "record-state",
    "--identity",
    identity,
    "--link",
    link,
    "--refinement",
    "refined",
    "--approach",
    "planned",
    "--plan",
    planHref,
  ];
  await record(...planned);
  if (ready) {
    const { basis } = JSON.parse(await record("read-state", "--link", link));
    await record(
      ...planned,
      "--assessment",
      "ready",
      "--expect-document",
      basis.document,
      "--expect-plan",
      basis.plan,
    );
  }
  await git(clone, "add", ".planning");
  await git(clone, "commit", "-qm", `Prepare ${identity}`);
  await git(clone, "push", "-q", "origin", "HEAD:main");
  return revParse(clone, "HEAD");
}

// An unlisted planned story drafted after Story A in seed A, with a new
// declared plan, in the originating checkout only.
export function draftLateStory(trunk) {
  const identity = "SEED-A#late";
  const link = "seeds/A.md#late";
  const seedPath = ".planning/seeds/A.md";
  const planPath = ".planning/quick/late/PLAN.md";
  const plan = "# Late plan\n\nDeliver late work.\n";
  writeDraft(trunk, planPath, plan);
  const seed = withFacts(
    `${readFileSync(join(trunk.integration, seedPath), "utf8")}\n${storySection("late", identity, "Late story", "Deliver late work.")}`,
    link,
    identity,
    "planned",
    "../quick/late/PLAN.md",
  );
  writeDraft(trunk, seedPath, seed);
  return {
    identity,
    seedPath,
    planPath,
    plan,
    section: seed.slice(seed.indexOf('<a id="late">')),
    args: admitArgs(identity, link, "Late story"),
  };
}

// Appends a sibling story to `seedPath` on remote trunk from another clone.
export function appendSiblingElsewhere(trunk, seedPath, anchor) {
  return pushFromElsewhere(
    trunk,
    seedPath,
    (text) =>
      `${text}\n${storySection(anchor, `SEED-A#${anchor}`, `Sibling ${anchor}`, "Kept.")}`,
  );
}

// Remote trunk at `rev` holds the story's drafted section once and its plan,
// lists it once, in Taken, and one claim commit of `publisher` admitted it.
export async function assertAdmittedOnce(trunk, rev, story, publisher) {
  const seed = await remoteText(trunk, rev, story.seedPath);
  assert.equal(seed.split('<a id="late">').length, 2, seed);
  assert.ok(seed.includes(story.section), seed);
  assert.equal(await remoteText(trunk, rev, story.planPath), story.plan);
  const entries = (await listed(trunk, rev)).filter(
    (entry) => entry.identity === story.identity,
  );
  assert.deepEqual(
    entries.map((entry) => entry.list),
    ["Taken"],
  );
  const log = (await git(trunk.origin, "log", "--format=%B", rev)).stdout;
  const claims = log.match(
    /^Claim-Identity: SEED-A#late\nClaim-Publisher: .+$/gm,
  );
  assert.deepEqual(claims, [
    `Claim-Identity: ${story.identity}\nClaim-Publisher: ${publisher}`,
  ]);
  await neverQueued(trunk, rev, story.identity);
}
