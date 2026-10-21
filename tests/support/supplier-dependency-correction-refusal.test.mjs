import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  fixture,
  publish,
  plan,
  supplierPlan,
  cleanupSupplier,
  resolveConsumer,
  homeBytes,
  consumer,
  supplier,
  readDependencies,
  dependency,
  updateDependency,
  git,
  revParse,
} from "./supplier-dependency-fixture.mjs";
import {
  correctionSummary,
  correction,
  mixedAgreement,
} from "./supplier-dependency-correction-fixture.mjs";

test("correction refuses stale, retargeted, absent and unverified inputs without changing the consumer", async (t) => {
  const f = await fixture(t);
  await mixedAgreement(f);
  const incomplete = await publish(f, "unfinished supplier");
  let before = homeBytes(f);
  const unfinished = await resolveConsumer(
    f,
    consumer,
    incomplete,
    incomplete,
    correction(incomplete),
    ["--correct-agreement"],
  );
  assert.equal(unfinished.code, 1);
  assert.match(unfinished.stderr, /every planned slice must be done/);
  assert.equal(homeBytes(f), before);

  const supplierHome = join(f.integration, ".planning/seeds/B.md");
  const supplierSource = readFileSync(supplierHome, "utf8");
  writeFileSync(join(f.integration, supplierPlan), plan("done"));
  writeFileSync(
    supplierHome,
    supplierSource.replace(supplier.identity, "WRONG-SUPPLIER"),
  );
  const wrongIdentity = await publish(
    f,
    "different supplier identity in history",
  );
  writeFileSync(supplierHome, supplierSource);
  writeFileSync(
    join(f.integration, ".planning/seeds/B-copy.md"),
    supplierSource,
  );
  await git(f.integration, "add", ".planning");
  await git(
    f.integration,
    "commit",
    "-m",
    "completed supplier evidence not yet accepted",
  );
  const evidence = await revParse(f.integration, "HEAD");
  const unaccepted = await resolveConsumer(
    f,
    consumer,
    evidence,
    evidence,
    correction(evidence),
    ["--correct-agreement"],
  );
  assert.equal(unaccepted.code, 1);
  assert.match(unaccepted.stderr, /authorized integration target/);
  assert.equal(homeBytes(f), before);
  await git(f.integration, "push", "origin", "main");
  const staleBasis = (await readDependencies(f.project, consumer)).basis;
  assert.equal(
    (
      await updateDependency(
        f.project,
        consumer,
        dependency(supplier, {
          condition: "Another writer's selected endpoint requirement.",
        }),
      )
    ).code,
    0,
  );
  const accepted = await cleanupSupplier(f);
  before = homeBytes(f);

  for (const [name, revision, overrides, extra, problem] of [
    [
      "stale",
      evidence,
      correction(evidence),
      ["--expect-dependencies", staleBasis],
      /agreement changed/,
    ],
    [
      "wrong historical identity",
      wrongIdentity,
      correction(wrongIdentity),
      [],
      /does not name the selected identity/,
    ],
    [
      "missing historical home",
      accepted,
      correction(accepted),
      [],
      /completion evidence could not be established/,
    ],
    [
      "wrong evidence path",
      evidence,
      correction(evidence, {
        resolution: {
          revision: evidence,
          path: ".planning/seeds/A.md#a",
          summary: correctionSummary,
        },
      }),
      [],
      /Resolution path must name/,
    ],
    [
      "retargeted relationship",
      evidence,
      correction(evidence, {
        supplier: { identity: supplier.identity, href: "seeds/B-copy.md#b" },
        resolution: {
          revision: evidence,
          path: ".planning/seeds/B-copy.md#b",
          summary: correctionSummary,
        },
      }),
      [],
      /cannot retarget/,
    ],
    [
      "absent relationship",
      evidence,
      correction(evidence, {
        supplier: { identity: "ABSENT", href: supplier.link },
      }),
      [],
      /relationship is missing/,
    ],
    [
      "missing outcome proof",
      evidence,
      correction(evidence, { resolution: undefined }),
      [],
      /satisfied dependency requires resolution evidence/,
    ],
    [
      "unresolved judgment",
      evidence,
      correction(evidence, { state: "waiting" }),
      [],
      /requires an evidenced satisfied condition judgment/,
    ],
  ]) {
    const refused = await resolveConsumer(
      f,
      consumer,
      revision,
      accepted,
      overrides,
      ["--correct-agreement", ...extra],
    );
    assert.equal(refused.code, 1, name);
    assert.match(refused.stderr, problem, name);
    assert.equal(homeBytes(f), before, name);
  }
});
