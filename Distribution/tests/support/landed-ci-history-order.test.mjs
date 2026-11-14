import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import {
  commitDeclaredRevision,
  integrationDeveloper,
  materializeLocalCheckout,
} from "./repository-fixture.mjs";
import { readLandingOrder } from "../../../dashboard/server/launchLandingGit.ts";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";

test("local landing ancestry ignores receipt order and missing Git falls back to persisted bounded order without a stale partial replacement", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("p", { backlog: null, files: { "p.txt": "preparation" } })
      .withRevision("e", { files: { "e.txt": "execution" } })
      .withRevision("r", { files: { "r.txt": "later" } })
      .please(),
  );
  const { p, e, r } = repository.revisions;
  const pLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: p, revision: p })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const eLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: p, revision: e })
    .deliveredAs({ delivery: "e", receipt: "e" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const rLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: e, revision: r })
    .deliveredAs({ delivery: "r", receipt: "r" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      pLanding,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: p,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: p })
            .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      eLanding,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: e,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: e, runId: 2 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(200).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      rLanding,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: r,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: r, runId: 3 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(300).please()])
            .please(),
        })
        .please(),
    )
    .please();
  const order = await readLandingOrder([repository.integration], [e, p, r], e);
  assert.deepEqual(order, [p, e, r]);
  assert.deepEqual(
    scopeHistoryOf(
      history,
      "tests",
      { revision: e, at: eLanding.receivedAt },
      order,
    ).entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [100, 200],
  );
  const storeDirectory = join(
    repository.fixture,
    "isolated-home/.open-dough/dashboard",
  );
  mkdirSync(storeDirectory, { recursive: true });
  writeFileSync(
    join(storeDirectory, "landed-ci-history.json"),
    JSON.stringify({ "open-dough": history }),
  );
  const storeModule = new URL(
    "../../../dashboard/server/landedCiHistoryStore.ts",
    import.meta.url,
  ).href;
  const kept = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--experimental-transform-types",
        "--input-type=module",
        "-e",
        `import {keepLandedCiOrder,readLandedCiHistory} from ${JSON.stringify(storeModule)}; const order=JSON.parse(process.argv[1]); await keepLandedCiOrder('open-dough',order); await keepLandedCiOrder('open-dough',order.slice(0,2)); console.log(JSON.stringify(await readLandedCiHistory('open-dough')));`,
        JSON.stringify(order),
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          HOME: join(repository.fixture, "isolated-home"),
          NODE_NO_WARNINGS: "1",
        },
      },
    ),
  );
  assert.deepEqual(kept.trunkOrder, [p, e, r]);
  assert.equal(
    await readLandingOrder(
      [join(repository.fixture, "missing-local-git")],
      [p, e, r],
      e,
    ),
    undefined,
  );
  assert.deepEqual(
    scopeHistoryOf(
      kept,
      "tests",
      { revision: e, at: eLanding.receivedAt },
      kept.trunkOrder,
    ).entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [100, 200],
  );
});

test("a story-first merge retains its earlier accepted second-parent landing through the selected endpoint, without private commits or later landings", async (t) => {
  const repository = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("a", {
        backlog: null,
        files: { "a.txt": "shared ancestor" },
      })
      .withRevision("p", {
        files: { "p.txt": "earlier accepted trunk landing" },
      })
      .withWorkspace("story", { from: "a" })
      .withUnpublishedRevision("b", {
        files: { "b.txt": "private story commit" },
      })
      .please(),
  );
  const { p, b } = repository.revisions;
  const fixtureGit = (folder, ...args) =>
    execFileSync("git", ["-C", folder, ...args], { encoding: "utf8" }).trim();
  // The story merges current trunk into itself, then trunk fast-forwards to C.
  fixtureGit(repository.execution, "merge", "--quiet", "--no-edit", p);
  const c = fixtureGit(repository.execution, "rev-parse", "HEAD");
  assert.deepEqual(
    fixtureGit(
      repository.execution,
      "show",
      "--format=%P",
      "--no-patch",
      c,
    ).split(" "),
    [b, p],
  );
  fixtureGit(repository.integration, "merge", "--quiet", "--ff-only", c);
  const laterFacts = makeMe.aRepository
    .withRevision("r", {
      backlog: null,
      files: { "r.txt": "later accepted trunk landing" },
    })
    .please().revisions[0];
  const r = await commitDeclaredRevision(
    repository.integration,
    laterFacts,
    integrationDeveloper,
  );
  const pLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: p, revision: p })
    .deliveredAs({ delivery: "p", receipt: "p" })
    .receivedAt("2026-11-03T00:00:00Z")
    .please();
  const cLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: p, revision: c })
    .deliveredAs({ delivery: "c", receipt: "c" })
    .receivedAt("2026-11-02T00:00:00Z")
    .please();
  const rLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository: repository.integration })
    .comparing({ base: c, revision: r })
    .deliveredAs({ delivery: "r", receipt: "r" })
    .receivedAt("2026-11-01T00:00:00Z")
    .please();
  const history = makeMe.aLandedCiHistory
    .recording(
      pLanding,
      "run/1/1",
      makeMe.aKeptBuild
        .with({
          revision: p,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: p })
            .entries([makeMe.aCiProofEntry.at("tests").timed(100).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      cLanding,
      "run/2/1",
      makeMe.aKeptBuild
        .with({
          revision: c,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: c, runId: 2 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(200).please()])
            .please(),
        })
        .please(),
    )
    .recording(
      rLanding,
      "run/3/1",
      makeMe.aKeptBuild
        .with({
          revision: r,
          state: "pass",
          proof: makeMe.aCiProof
            .forRun({ revision: r, runId: 3 })
            .entries([makeMe.aCiProofEntry.at("tests").timed(300).please()])
            .please(),
        })
        .please(),
    )
    .please();
  const order = await readLandingOrder([repository.integration], [c, p, r], c);
  assert.deepEqual(order, [p, c, r]);
  assert.ok(!order.includes(b));
  const projected = scopeHistoryOf(
    history,
    "tests",
    { revision: c, at: cLanding.receivedAt },
    order,
  );
  assert.deepEqual(
    projected.entries.map(
      (entry) => entry.readings.find((reading) => reading.unit === "case")?.ms,
    ),
    [100, 200],
  );
  assert.deepEqual(
    projected.entries.flatMap((entry) =>
      entry.landings.map((landing) => landing.revision),
    ),
    [p, c],
  );
  assert.equal(projected.entries[1].selected, true);
});
