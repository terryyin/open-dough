// Historical metadata is read from immutable local Git objects. Current working
// files and titles never stand in for the revision of a native activity.
import path from "node:path";
import {
  usageHome,
  usageHomeDiscovery,
  usageBacklogEntries,
} from "./usageStoryReaders.ts";
import { doneRecordOf } from "../src/doneRecord.ts";
import { runGit } from "./gitRunner.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";
import type { UsageSource } from "./usageRecords.ts";

const immutableReads = new Map<string, Promise<string | undefined>>();
export async function usageGit(
  cwd: string,
  args: string[],
): Promise<string | undefined> {
  const read = async () => {
    try {
      return (
        await runGit(args, { cwd, maxBuffer: 8 * 1024 * 1024 })
      ).stdout.trim();
    } catch {
      return undefined;
    }
  };
  if (
    !["show", "ls-tree", "log", "rev-parse"].includes(args[0] ?? "") ||
    !args.some((arg) => /^[a-f0-9]{40,64}(?::|$|\^)/i.test(arg))
  )
    return read();
  const key = JSON.stringify([cwd, args]);
  let pending = immutableReads.get(key);
  if (!pending) {
    pending = read();
    immutableReads.set(key, pending);
  }
  return pending;
}
type Story = { identity: string; title: string | null; sources: UsageSource[] };
const cache = new Map<string, Promise<Story | undefined>>();
function identityIn(text: string, href: string) {
  try {
    return usageHome(text, href).identity;
  } catch {
    return undefined;
  }
}
function seedStory(
  text: string,
  reference: string,
  file: string,
): Omit<Story, "sources"> | undefined {
  const identity = reference.match(/SEED-\d+#[a-z0-9-]+/i)?.[0];
  const fragment = reference.split("#")[1];
  const homes: Omit<Story, "sources">[] = [];
  try {
    const discovery = usageHomeDiscovery(text);
    const anchors = fragment
      ? [fragment]
      : discovery.anchors.length
        ? discovery.anchors
        : discovery.wholeDocument
          ? [""]
          : [];
    for (const anchor of anchors) {
      const home = usageHome(
        text,
        anchor ? `seeds/historical.md#${anchor}` : "historical.md",
      );
      const candidate = home.identity;
      if (candidate && (!identity || candidate === identity)) {
        homes.push({
          identity: candidate,
          title: home.title,
        });
      }
    }
  } catch {
    /* An unrelated or malformed canonical home is not evidence. */
  }
  if (homes.length === 1) return homes[0];
  const completion = doneRecordOf(path.posix.basename(file), text);
  if (
    completion.status === "read" &&
    (identity
      ? completion.story.identity === identity
      : !fragment || completion.story.identity.split("#")[1] === fragment)
  )
    return {
      identity: completion.story.identity,
      title: completion.story.title,
    };
  try {
    const entries = usageBacklogEntries(text).filter((entry) =>
      identity
        ? entry.identity === identity
        : fragment
          ? entry.href.endsWith(`#${fragment}`)
          : entry.identity.startsWith(reference.match(/SEED-\d+/)?.[0] ?? "\0"),
    );
    const entry = entries[0];
    if (entries.length === 1 && entry)
      return { identity: entry.identity, title: entry.title };
  } catch {
    /* This source is not a canonical backlog. */
  }
  return undefined;
}
async function resolveStory(
  project: ConfiguredProject,
  revision: string,
  reference: string,
): Promise<Story | undefined> {
  if (!/^[a-f0-9]{40,64}$/i.test(revision)) return undefined;
  const verified = await usageGit(project.localPath, [
    "rev-parse",
    "--verify",
    `${revision}^{commit}`,
  ]);
  if (verified !== revision) return undefined;
  const source = (file: string, at = revision): UsageSource => ({
    kind: "git",
    file,
    repository: project.repository,
    revision: at,
  });
  const fileReference = reference.split("#")[0]?.replace(/^\.\//, "");
  let lookup = reference;
  const sources: UsageSource[] = [];
  if (fileReference?.endsWith("/PLAN.md")) {
    const plan = await usageGit(project.localPath, [
      "show",
      `${revision}:${fileReference}`,
    ]);
    if (!plan) return undefined;
    sources.push(source(fileReference));
    const identity = identityIn(plan, fileReference);
    const href = /\*\*Source:\*\*[^\n]*\]\(([^)]+)\)/.exec(plan)?.[1];
    if (identity) lookup = identity;
    else if (href)
      lookup = path.posix.normalize(
        path.posix.join(path.posix.dirname(fileReference), href),
      );
    else return undefined;
  }
  const identity = lookup.match(/SEED-\d+#[a-z0-9-]+/i)?.[0];
  const seed = identity?.split("#")[0] ?? lookup.match(/SEED-\d+/)?.[0];
  const files =
    (
      await usageGit(project.localPath, [
        "ls-tree",
        "-r",
        "--name-only",
        revision,
        "--",
        ".planning",
      ])
    )?.split("\n") ?? [];
  const candidates = files.filter(
    (file) =>
      /\.(md|json)$/.test(file) &&
      (seed
        ? file.includes(seed) || /PRODUCT-BACKLOG|\/PLAN\.md$/.test(file)
        : file === fileReference),
  );
  const found: Story[] = [];
  for (const file of candidates) {
    const text = await usageGit(project.localPath, [
      "show",
      `${revision}:${file}`,
    ]);
    if (!text) continue;
    const story = seedStory(text, lookup, file);
    if (story) found.push({ ...story, sources: [...sources, source(file)] });
  }
  const identities = new Set(found.map((story) => story.identity));
  // A seed and a completion record can agree while a plan has a generic heading.
  const preferred = found.filter((story) =>
    story.sources.some((item) => /\/seeds\/|\/done\//.test(item.file)),
  );
  const choices = preferred.length ? preferred : found;
  const titles = new Set(choices.map((story) => story.title).filter(Boolean));
  if (identities.size === 1 && choices[0])
    return {
      identity: choices[0].identity,
      title: titles.size === 1 ? choices[0].title : null,
      sources: choices.flatMap((story) => story.sources),
    };
  return undefined;
}
export function historicalUsageStory(
  project: ConfiguredProject,
  revision: string,
  reference: string,
) {
  const key = JSON.stringify([project.localPath, revision, reference]);
  let pending = cache.get(key);
  if (!pending) {
    pending = resolveStory(project, revision, reference);
    cache.set(key, pending);
  }
  return pending;
}
// The reflog is local, timestamped revision evidence. A current HEAD without a
// recorded activity-time entry is deliberately insufficient.
export async function usageRevisionAt(cwd: string, at: string | undefined) {
  if (!at) return undefined;
  const entries = await usageGit(cwd, [
    "reflog",
    "--date=iso-strict",
    "--format=%H%x09%gD",
  ]);
  for (const line of entries?.split("\n") ?? []) {
    const [revision, selector] = line.split("\t");
    const time = selector?.match(/@\{(.+)\}/)?.[1];
    if (revision && time && Date.parse(time) <= Date.parse(at)) return revision;
  }
  return undefined;
}
