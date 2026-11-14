// Mutable repository state, unavailable objects and cancellation retain the
// original Git boundary semantics even when immutable reads can be reused.
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { publishedStoryHistory } from "../../server/publishedStoryHistory.ts";
import {
  isAncestor as uncachedIsAncestor,
  runGit,
} from "../../server/gitRunner.ts";
import { storyCompletionEndpoints } from "../../server/storyCompletionEndpoints.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  historyFacts,
  historySource,
} from "../support/publishedStoryHistoryFixture.ts";
import {
  endpointAuthor,
  endpointIdentity,
  endpointProfilePath,
} from "../support/comparisonEndpointPrefix.ts";

test("a history reader observes later mutable refs and current worktree identity", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const history = publishedStoryHistory({
      cwd: repository.integration,
      maxBuffer: 1024 * 1024,
    });
    await git(
      repository.integration,
      "update-ref",
      "refs/remotes/origin/main",
      r.start,
    );
    expect(await history.orderedAt("origin/main")).toEqual([r.start]);
    await git(
      repository.integration,
      "update-ref",
      "refs/remotes/origin/main",
      r.work,
    );
    expect(await history.orderedAt("origin/main")).toEqual([
      r.work,
      r.claim,
      r.start,
    ]);
    await git(
      repository.integration,
      "config",
      "--worktree",
      "author.name",
      "first-owner",
    );
    expect(await history.worktreeConfig("author.name")).toBe("first-owner");
    await git(
      repository.integration,
      "config",
      "--worktree",
      "author.name",
      "next-owner",
    );
    expect(await history.worktreeConfig("author.name")).toBe("next-owner");
  } finally {
    await repository.cleanup();
  }
});

test("failed immutable reads and ancestry errors do not hide restored Git history", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const history = publishedStoryHistory({
      cwd: repository.integration,
      maxBuffer: 1024 * 1024,
    });
    const objects = path.join(repository.integration, ".git", "objects");
    const held = `${objects}-held`;
    await rename(objects, held);
    await mkdir(objects);
    try {
      expect(
        await history.profileTextsAt(endpointProfilePath, [r.claim]),
      ).toEqual(new Map());
      await expect(history.orderedAt(r.work)).rejects.toThrow();
      expect(await history.isAncestor(r.work, r.done)).toBe(false);
    } finally {
      await rm(objects, { recursive: true });
      await rename(held, objects);
    }
    expect([
      ...(await history.profileTextsAt(endpointProfilePath, [r.claim])).keys(),
    ]).toEqual([r.claim]);
    expect(await history.orderedAt(r.work)).toEqual([r.work, r.claim, r.start]);
    expect(await history.isAncestor(r.work, r.done)).toBe(true);
    expect(await history.isAncestor(r.work, r.start)).toBe(false);
  } finally {
    await repository.cleanup();
  }
});

test("an aborted reader cannot return a warm immutable answer and retains ancestry's false-on-error contract", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const controller = new AbortController();
    const call = {
      cwd: repository.integration,
      maxBuffer: 1024 * 1024,
      signal: controller.signal,
    };
    const history = publishedStoryHistory(call);
    expect(await history.orderedAt(r.work)).toEqual([r.work, r.claim, r.start]);
    expect(await history.isAncestor(r.work, r.done)).toBe(true);
    controller.abort();
    await expect(history.orderedAt(r.work)).rejects.toThrow();
    expect(await history.isAncestor(r.work, r.done)).toBe(false);
    await expect(
      storyCompletionEndpoints(
        historySource,
        endpointIdentity,
        r.landing,
        call,
      ),
    ).rejects.toThrow();
    const active = new AbortController();
    const pending = publishedStoryHistory({
      ...call,
      signal: active.signal,
    }).orderedAt(r.landing);
    active.abort();
    await expect(pending).rejects.toThrow();
  } finally {
    await repository.cleanup();
  }
});

test("a negative ancestry answer observes history deepened past a shallow boundary", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const call = { cwd: repository.integration, maxBuffer: 1024 * 1024 };
    const history = publishedStoryHistory(call);
    const shallow = path.join(repository.integration, ".git", "shallow");
    await writeFile(shallow, `${r.done}\n`);
    await expect(
      runGit(["merge-base", "--is-ancestor", r.work, r.done], call),
    ).rejects.toMatchObject({ cause: { code: 1 } });
    expect(await uncachedIsAncestor(r.work, r.done, call)).toBe(false);
    expect(await history.isAncestor(r.work, r.done)).toBe(false);
    await rm(shallow);
    expect(await uncachedIsAncestor(r.work, r.done, call)).toBe(true);
    expect(await history.isAncestor(r.work, r.done)).toBe(true);
  } finally {
    await repository.cleanup();
  }
});

test("successful graph walks observe history deepened past their shallow boundary", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const trace = path.join(repository.fixture, "shallow-trace.json");
    const call = {
      cwd: repository.integration,
      maxBuffer: 1024 * 1024,
      env: { GIT_TRACE2_EVENT: trace },
    };
    const shallow = path.join(repository.integration, ".git", "shallow");
    await writeFile(shallow, `${r.landing}\n`);
    const history = publishedStoryHistory(call);
    const queries = [
      ["rev-list", "--topo-order", r.landing],
      [
        "rev-list",
        "--topo-order",
        "--parents",
        "--fixed-strings",
        `--author=<${endpointAuthor.email}>`,
        r.landing,
      ],
      ["rev-list", "--merges", "--parents", r.landing, `^${r.start}`],
      [
        "log",
        "--full-history",
        "--format=",
        "--name-only",
        `-G${endpointIdentity}`,
        r.landing,
        "--",
        ".planning/agents",
      ],
    ];
    const observeWalks = async () => {
      const found = await Promise.all([
        history.orderedAt(r.landing),
        history.authoredAt(r.landing, endpointAuthor.email),
        history.mergesBetween(r.landing, r.start),
        history.matchingProfilePaths(
          r.landing,
          ".planning/agents",
          endpointIdentity,
        ),
      ]);
      const actual = await Promise.all(
        queries.map((args) => runGit(args, call)),
      );
      const printed = actual.map(({ stdout }) => stdout.trim());
      expect(
        found.map((walk) =>
          walk
            .map((row) =>
              typeof row === "string"
                ? row
                : [row.commit, ...row.parents].join(" "),
            )
            .join("\n")
            .trim(),
        ),
      ).toEqual(printed);
      return printed;
    };
    const before = await observeWalks();
    await rm(shallow);
    const after = await observeWalks();
    for (const [index, printed] of before.entries())
      expect(after[index], queries[index]?.join(" ")).not.toBe(printed);
    const events = (await readFile(trace, "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { event: string; argv?: string[] });
    expect(
      events.filter(
        ({ event, argv }) =>
          event === "start" &&
          argv?.[1] === "rev-parse" &&
          argv[2] === "--is-shallow-repository",
      ).length,
    ).toBeLessThanOrEqual(1);
  } finally {
    await repository.cleanup();
  }
});
