// Plain preparation-page consumers of either host, and one overriding its
// queued repository with a later revision, report what their origin started
// from to the outer proof (runtime/test-preparation-budget.spec.ts).
import { queuedReadyRepository } from "../../../../Distribution/tests/support/queued-repository.mjs";
import { test } from "../../support/preparationPage.ts";
import {
  changedReviewRevision,
  type StartOrigin,
} from "../../support/startOrigin.ts";
import { reportCase } from "./reportCase.ts";

async function report(origin: StartOrigin, host: string) {
  const branches = await origin.originGit(
    "for-each-ref",
    "--format=%(refname:short)",
    "refs/heads/",
  );
  const tree = await origin.originGit("ls-tree", "--name-only", "main");
  // A private write the next case's copy must not see.
  await origin.originGit("update-ref", "refs/heads/private-proof", "main");
  reportCase({
    host,
    origin: origin.origin,
    branches: branches.trim().split("\n"),
    tree: tree.trim().split("\n"),
    revisions: Object.keys(origin.revisions),
    mainIsLast:
      (await origin.originGit("rev-parse", "main")).trim() ===
      Object.values(origin.revisions).at(-1),
  });
}

test("a Claude case starts from its prepared origin", async ({ origin }) => {
  await report(origin, "claude");
});

test.describe("on Codex", () => {
  test.use({ preparationHost: "codex" });
  test("a Codex case starts from its prepared origin", async ({ origin }) => {
    await report(origin, "codex");
  });
});

test.describe("with a later revision", () => {
  test.use({
    originRepository: queuedReadyRepository()
      .withRevision("changed review", changedReviewRevision)
      .please(),
  });
  test("an overriding case keeps its later revision", async ({ origin }) => {
    await report(origin, "claude");
  });
});
