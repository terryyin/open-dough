import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { markDone } from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  launchIsolatedReview,
} from "../../test-support/support/adHocReview.ts";
import {
  expect,
  test,
} from "../../test-support/support/branchResultValidation.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";

test.use({ serverMode: "boundary" });

test("a failed verification retries at the same revision and lets other deliveries settle", async ({
  origin,
  request,
  dashboard,
  validation,
}) => {
  const retrying = await launchIsolatedReview(
    dashboard,
    "Keep draft for retry",
  );
  const draft = commit(retrying.workspace, "retry.txt");
  dashboard.claudeSessionBecomes(retrying.session, "done-live");
  const retryingDone = await markDone(dashboard, {
    source: "open-dough",
    session: retrying.session,
  });
  expect(retryingDone.status, retryingDone.body).toBe(200);
  const independent = await launchIsolatedReview(
    dashboard,
    "Keep independent work",
  );
  const other = commit(independent.workspace, "independent.txt");
  dashboard.claudeSessionBecomes(independent.session, "done-live");
  const independentDone = await markDone(dashboard, {
    source: "open-dough",
    session: independent.session,
  });
  expect(independentDone.status, independentDone.body).toBe(200);

  git(origin.project, "merge", "--quiet", "--no-ff", "--no-edit", draft);
  const firstMerge = git(origin.project, "rev-parse", "HEAD");
  git(origin.project, "merge", "--quiet", "--no-ff", "--no-edit", other);
  const head = git(origin.project, "rev-parse", "HEAD");
  git(origin.project, "push", "--quiet", "origin", "main");
  validation.failOnceFor(draft);

  const query = { source: "open-dough", since: retrying.baseline };
  const first = await getReview(
    request,
    dashboard,
    authenticatedReadEndpoint,
    query,
  );
  expect(first.status()).toBe(200);
  expect(await first.json()).toMatchObject({ revision: head });
  await expect
    .poll(() => adHocReview(request, dashboard, independent.session))
    .toMatchObject({
      kind: "landed",
      baseline: firstMerge,
      tree: head,
      files: [{ path: "independent.txt" }],
    });
  expect(validation.failed()).toBe(true);
  expect(await adHocReview(request, dashboard, retrying.session)).toMatchObject(
    {
      kind: "branch-result",
      tree: draft,
    },
  );

  await expect
    .poll(async () => {
      const repeated = await getReview(
        request,
        dashboard,
        authenticatedReadEndpoint,
        {
          ...query,
          since: head,
        },
      );
      expect(repeated.status()).toBe(200);
      expect(await repeated.json()).toMatchObject({
        revision: head,
        changed: false,
      });
      return adHocReview(request, dashboard, retrying.session);
    })
    .toMatchObject({
      kind: "landed",
      baseline: retrying.baseline,
      tree: firstMerge,
      files: [{ path: "retry.txt" }],
    });
});
