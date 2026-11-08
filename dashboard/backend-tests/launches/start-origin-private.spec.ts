import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";

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
  } finally {
    first.cleanup();
    second.cleanup();
  }
});
