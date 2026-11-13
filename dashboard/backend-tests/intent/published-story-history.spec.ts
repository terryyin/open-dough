// Real Git and native Trace2 observe recovery facts and query reuse.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { materializeRepository } from "../../../tests/support/repository-fixture.mjs";
import { publishedStoryHistory } from "../../server/publishedStoryHistory.ts";
import { storyCompletionEndpoints } from "../../server/storyCompletionEndpoints.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  historyFacts,
  historySource,
} from "../support/publishedStoryHistoryFixture.ts";
import {
  endpointIdentity,
  endpointAuthor,
  endpointProfilePath,
} from "../support/comparisonEndpointPrefix.ts";

async function starts(
  file: string,
  successfulOnly = false,
): Promise<string[][]> {
  const events = (await readFile(file, "utf8"))
    .trim()
    .split("\n")
    .map(
      (line) =>
        JSON.parse(line) as {
          event: string;
          sid: string;
          argv?: string[];
          code?: number;
        },
    );
  const successful = new Set(
    events
      .filter((event) => event.event === "exit" && event.code === 0)
      .map((event) => event.sid),
  );
  return events.flatMap((event) =>
    event.event === "start" &&
    event.argv &&
    (!successfulOnly || successful.has(event.sid))
      ? [event.argv.slice(1)]
      : [],
  );
}

test("one completion recovery reuses immutable claim history and ancestry without changing endpoint facts", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const trace = path.join(repository.fixture, "history-trace.json");
    const recovered = await storyCompletionEndpoints(
      historySource,
      endpointIdentity,
      r.landing,
      {
        cwd: repository.integration,
        maxBuffer: 64 * 1024 * 1024,
        env: { GIT_TRACE2_EVENT: trace },
      },
    );
    expect(recovered).toMatchObject({
      kind: "facts",
      facts: {
        identity: endpointIdentity,
        completion: r.landing,
        agent: endpointAuthor.name,
        mode: "story-branch",
        branch: "story",
        storyStart: r.start,
        claims: [r.claim],
        landing: { merge: r.landing, branchSide: r.done },
      },
      claim: { claims: [r.claim], storyStart: r.start },
    });
    const calls = await starts(trace);
    const authored = calls.filter(
      (args) => args[0] === "rev-list" && args.includes("--fixed-strings"),
    );
    expect(authored.length).toBeGreaterThan(0);
    expect(new Set(authored.map((args) => JSON.stringify(args))).size).toBe(
      authored.length,
    );
    const agents = calls.filter(
      (args) => args[0] === "log" && args.includes("--full-history"),
    );
    expect(agents.length).toBeGreaterThan(0);
    expect(new Set(agents.map((args) => JSON.stringify(args))).size).toBe(
      agents.length,
    );
    const ancestry = (await starts(trace, true)).filter(
      (args) => args[0] === "merge-base" && args[1] === "--is-ancestor",
    );
    expect(ancestry.length).toBeGreaterThan(0);
    expect(ancestry.map((args) => JSON.stringify(args))).toEqual([
      ...new Set(ancestry.map((args) => JSON.stringify(args))),
    ]);
  } finally {
    await repository.cleanup();
  }
});

test("profile batches distinguish their revision input and path while concurrent fixed reads share their native work", async () => {
  const repository = await materializeRepository(historyFacts);
  try {
    const r = repository.revisions;
    const trace = path.join(repository.fixture, "batch-trace.json");
    await writeFile(
      path.join(repository.integration, ".git", "shallow"),
      `${r.landing}\n`,
    );
    const call = {
      cwd: repository.integration,
      maxBuffer: 1024 * 1024,
      env: { GIT_TRACE2_EVENT: trace },
    };
    const history = publishedStoryHistory(call);
    const [first, repeated] = await Promise.all([
      history.profileTextsAt(endpointProfilePath, [r.claim, r.work]),
      history.profileTextsAt(endpointProfilePath, [r.claim, r.work]),
    ]);
    expect(first).toEqual(repeated);
    expect([...first.keys()]).toEqual([r.claim, r.work]);
    expect(await history.profileTextsAt(endpointProfilePath, [r.done])).toEqual(
      new Map(),
    );
    expect(await history.profileTextsAt("shared.txt", [r.work])).toEqual(
      new Map([[r.work, "story edit\ntrunk original\n"]]),
    );
    expect(
      await publishedStoryHistory(call).profileTextsAt(endpointProfilePath, [
        r.claim,
        r.work,
      ]),
    ).toEqual(first);
    const calls = await starts(trace);
    expect(
      calls.filter(
        (args) => args[0] === "cat-file" && args[1] === "--batch-check",
      ),
    ).toHaveLength(4);
    expect(
      calls.filter((args) => args[0] === "cat-file" && args[1] === "--batch"),
    ).toHaveLength(3);
  } finally {
    await repository.cleanup();
  }
});
