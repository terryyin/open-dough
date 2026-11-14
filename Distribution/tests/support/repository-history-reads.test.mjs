// The in-memory comparison acquisition reads the same MakeMe history as Git.
// This is transport parity, not replacement proof for comparison selection.
import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import { repositoryHistoryReads } from "./repositoryHistoryReads.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import { comparisonHistory } from "../../../dashboard/server/comparisonBuildSource.ts";
import { publishedStoryHistory } from "../../../dashboard/server/publishedStoryHistory.ts";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

test("described trunk and branch history reads match an independent real repository", async () => {
  const workflow = "on:\n  push:\n    paths-ignore:\n      - 'docs/**'\n";
  const description = makeMe.aRepository
    .withRevision("base", {
      files: { ".github/workflows/ci.yml": workflow, "removed.ts": "old" },
    })
    .withRevision("next", {
      files: { "code.ts": "new" },
      remove: ["removed.ts"],
    })
    .withRevision("head", { files: { "docs/note.md": "text" } })
    .withRevision("side", { parents: ["base"], files: { "side.ts": "side" } })
    .withRevision("merge", {
      parents: ["head", "side"],
      files: { "side.ts": "side" },
    })
    .withWorkspace("story", { from: "next" })
    .withUnpublishedRevision("work", { files: { "code.ts": "changed" } })
    .please();
  const repository = await materializeRepository(description);
  try {
    const memory = repositoryHistoryReads(description).history;
    const real = comparisonHistory({
      cwd: repository.execution,
      maxBuffer: 1024 * 1024,
    });
    const names = Object.fromEntries(
      Object.entries(repository.revisions).map(([name, sha]) => [sha, name]),
    );
    for (const name of ["head", "merge", "work"])
      assert.deepEqual(
        (await real.firstParents(repository.revisions[name], 2)).map(
          (sha) => names[sha],
        ),
        await memory.firstParents(name, 2),
      );
    assert.deepEqual(
      (
        await real.laterTrunk(
          repository.revisions.base,
          repository.revisions.merge,
          3,
        )
      ).map((sha) => names[sha]),
      await memory.laterTrunk("base", "merge", 3),
    );
    assert.equal(
      await real.workflowAt(
        repository.revisions.work,
        ".github/workflows/ci.yml",
      ),
      await memory.workflowAt("work", ".github/workflows/ci.yml"),
    );
    assert.deepEqual(
      await real.changesBetween(
        repository.revisions.base,
        repository.revisions.work,
      ),
      await memory.changesBetween("base", "work"),
    );
  } finally {
    await repository.cleanup();
  }
});

test("published raw facts preserve authors, ordered parents, profile bytes and ancestry across acquisition", async () => {
  const identity = "SEED-1#history";
  const otherIdentity = "SEED-2#other";
  const owner = agentIdentity("Yui");
  const profile = `.planning/${owner.path}`;
  const description = makeMe.aRepository
    .withCheckoutIdentity({
      name: "Maintainer",
      email: "maintainer@example.test",
    })
    .withRevision("base")
    .withRevision("claim", {
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({
            name: "Yui",
            identity,
            mode: "story-branch",
            branch: "story",
          })
          .please(),
      ],
      author: { name: owner.agent, email: owner.email },
    })
    .withRevision("work", {
      files: { "work.txt": "own work\n" },
      committer: { name: "Recorder", email: "recorder@example.test" },
    })
    .withRevision("side", {
      parents: ["base"],
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({ name: "Kirara", identity: otherIdentity, mode: "trunk" })
          .please(),
      ],
      author: { name: "Other author", email: "other@example.test" },
    })
    .withRevision("merge", {
      parents: ["work", "side"],
      author: { name: owner.agent, email: owner.email },
    })
    .withRevision("replacement", {
      agentProfiles: [
        makeMe.anAgentProfile
          .executing({ name: "Yui", identity: otherIdentity, mode: "trunk" })
          .please(),
      ],
    })
    .withRevision("head", { remove: [profile] })
    .withWorkspace("private", {
      from: "work",
      checkoutIdentity: {
        name: "Workspace developer",
        email: "workspace@example.test",
      },
    })
    .withUnpublishedRevision("private", {
      files: { "private.txt": "private work\n" },
    })
    .please();
  const repository = await materializeRepository(description);
  try {
    const memory = repositoryHistoryReads(description).publishedStoryHistory;
    const real = publishedStoryHistory({
      cwd: repository.execution,
      maxBuffer: 1024 * 1024,
    });
    const named = Object.fromEntries(
      Object.entries(repository.revisions).map(([name, sha]) => [sha, name]),
    );
    const namedRows = (rows) =>
      rows.map(({ commit, parents }) => ({
        commit: named[commit],
        parents: parents.map((parent) => named[parent]),
      }));
    const actualOwner = namedRows(
      await real.authoredAt(repository.revisions.head, owner.email),
    );
    assert.deepEqual(actualOwner, [
      { commit: "merge", parents: ["work", "side"] },
      { commit: "claim", parents: ["base"] },
    ]);
    assert.deepEqual(await memory.authoredAt("head", owner.email), actualOwner);
    for (const [head, email] of [
      ["head", "maintainer@example.test"],
      ["head", "recorder@example.test"],
      ["private", "workspace@example.test"],
    ])
      assert.deepEqual(
        await memory.authoredAt(head, email),
        namedRows(await real.authoredAt(repository.revisions[head], email)),
      );
    const profileNames = ["claim", "side", "replacement", "head"];
    const actualProfiles = new Map(
      [
        ...(await real.profileTextsAt(
          profile,
          profileNames.map((name) => repository.revisions[name]),
        )),
      ].map(([sha, text]) => [named[sha], text]),
    );
    assert.deepEqual([...actualProfiles.keys()], ["claim", "replacement"]);
    assert.deepEqual(
      await memory.profileTextsAt(profile, profileNames),
      actualProfiles,
    );
    for (const queryIdentity of [identity, otherIdentity])
      assert.deepEqual(
        new Set(
          await memory.matchingProfilePaths(
            "head",
            ".planning/agents",
            queryIdentity,
          ),
        ),
        new Set(
          (
            await real.matchingProfilePaths(
              repository.revisions.head,
              ".planning/agents",
              queryIdentity,
            )
          ).filter(Boolean),
        ),
      );
    const realOrder = (await real.orderedAt(repository.revisions.head)).map(
      (sha) => named[sha],
    );
    const memoryOrder = await memory.orderedAt("head");
    assert.deepEqual(new Set(memoryOrder), new Set(realOrder));
    for (const ordered of [realOrder, memoryOrder]) {
      assert(ordered.indexOf("merge") < ordered.indexOf("work"));
      assert(ordered.indexOf("merge") < ordered.indexOf("side"));
      assert(ordered.indexOf("side") < ordered.indexOf("base"));
    }
    for (const topological of [false, true])
      assert.deepEqual(
        await memory.mergesBetween("head", "claim", topological),
        namedRows(
          await real.mergesBetween(
            repository.revisions.head,
            repository.revisions.claim,
            topological,
          ),
        ),
      );
    assert.deepEqual(await memory.mergesBetween("head", "merge"), []);
    for (const [ancestor, descendant] of [
      ["claim", "head"],
      ["side", "claim"],
      ["head", "head"],
    ])
      assert.equal(
        await memory.isAncestor(ancestor, descendant),
        await real.isAncestor(
          repository.revisions[ancestor],
          repository.revisions[descendant],
        ),
      );
    assert.equal(await memory.isAncestor("missing", "head"), false);
    for (const key of ["author.name", "author.email"]) {
      assert.equal(await real.worktreeConfig(key), "");
      assert.equal(await memory.worktreeConfig(key), "");
    }
  } finally {
    await repository.cleanup();
  }
});
