import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";
import { keepStartedOrigin } from "../../tests/support/startOriginPreparation.ts";

// One queued story of its own: no run-wide description starts this way.
const privateStory = makeMe.aBacklogEntry
  .with({
    identity: "SEED-PRIVATE#own",
    href: "seeds/PRIVATE.md#own",
    title: "A story of its own",
  })
  .please();
const privateRepository = makeMe.aRepository
  .withRevision("own story", {
    backlog: { queued: [privateStory] },
    files: { ".planning/seeds/PRIVATE.md": "# Seed PRIVATE\n" },
  })
  .please();

test("an origin started from a description no run prepares holds its facts and the installed skills in one reused root commit", async () => {
  const first = await startOrigin(privateRepository);
  const second = await startOrigin(privateRepository);
  try {
    const root = (origin: typeof first) =>
      origin.originGit("rev-list", "--max-parents=0", "main");
    expect((await first.originGit("rev-list", "--count", "main")).trim()).toBe(
      "1",
    );
    const files = (
      await first.originGit("ls-tree", "-r", "--name-only", "main")
    )
      .trim()
      .split("\n");
    expect(files).toEqual(
      expect.arrayContaining([
        ".claude/skills/dough-execute-plan/SKILL.md",
        ".planning/PRODUCT-BACKLOG.md",
        ".planning/seeds/PRIVATE.md",
      ]),
    );
    expect(
      await first.originGit("show", "main:.planning/PRODUCT-BACKLOG.md"),
    ).toContain(`— ${privateStory.identity}`);
    // The second origin is a copy of the same prepared history, not a rebuild.
    expect((await root(second)).trim()).toBe((await root(first)).trim());
    for (const origin of [first, second])
      expect(origin.revision("own story")).toBe((await root(origin)).trim());
  } finally {
    first.cleanup();
    second.cleanup();
  }
});

// A first commit no run prepares and a later revision, kept by this worker
// as a worker keeps its completed story (../../tests/support/keptPublishedStory.ts).
const keptRepository = makeMe.aRepository
  .withRevision("own story", {
    backlog: { queued: [privateStory] },
    files: { ".planning/seeds/PRIVATE.md": "# Seed PRIVATE\n" },
  })
  .withRevision("kept change", { files: { "kept.txt": "kept\n" } })
  .please();

test("a kept started origin names its revisions in every later copy, each edited and cleaned on its own", async () => {
  const started = await startOrigin(keptRepository);
  const tip = started.revision("kept change");
  try {
    keepStartedOrigin("claude", keptRepository, started);
  } finally {
    started.cleanup();
  }
  const first = await startOrigin(keptRepository);
  const second = await startOrigin(keptRepository);
  try {
    for (const origin of [first, second]) {
      expect(origin.revision("kept change")).toBe(
        (await origin.originGit("rev-parse", "main")).trim(),
      );
      expect(origin.revision("own story")).toBe(
        (await origin.originGit("rev-parse", "main^")).trim(),
      );
      expect(origin.revision("kept change")).toBe(tip);
    }
    await first.publishRevision({ files: { "first.txt": "first\n" } });
    first.cleanup();
    expect((await second.originGit("rev-parse", "main")).trim()).toBe(tip);
    const later = await startOrigin(keptRepository);
    try {
      expect((await later.originGit("rev-parse", "main")).trim()).toBe(tip);
      expect(later.revision("kept change")).toBe(tip);
    } finally {
      later.cleanup();
    }
  } finally {
    first.cleanup();
    second.cleanup();
  }
});

// The run-wide queued prefix and one later revision each start commits on
// its own copy of the prepared origin.
const extendedRepository = queuedReadyRepository()
  .withRevision("later change", { files: { "later.txt": "later\n" } })
  .please();

test("origins extending the run-wide prefix name its commit and their own later revision, each edited and cleaned on its own", async () => {
  const first = await startOrigin(extendedRepository);
  const second = await startOrigin(extendedRepository);
  const endpoints = async (origin: typeof first) => ({
    prefix: (await origin.originGit("rev-parse", "main^")).trim(),
    later: (await origin.originGit("rev-parse", "main")).trim(),
  });
  try {
    for (const origin of [first, second])
      expect({
        prefix: origin.revision("base"),
        later: origin.revision("later change"),
      }).toEqual(await endpoints(origin));
    const started = await endpoints(second);
    await first.publishRevision({ files: { "first.txt": "first\n" } });
    first.cleanup();
    expect(await endpoints(second)).toEqual(started);
    const later = await startOrigin(extendedRepository);
    try {
      expect(later.revision("base")).toBe(started.prefix);
      expect(await endpoints(later)).toEqual({
        prefix: later.revision("base"),
        later: later.revision("later change"),
      });
    } finally {
      later.cleanup();
    }
  } finally {
    first.cleanup();
    second.cleanup();
  }
});
