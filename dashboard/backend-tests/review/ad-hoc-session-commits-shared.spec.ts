// A Default main session's review says when another kept session of the
// project was open in the same checkout while it was: the commits read from
// the checkout from its launch to Done may then include that session's work.
// Over raw HTTP at the boundary server, with a real project checkout
// (../../tests/support/startOrigin.ts) and plain Git in it
// (../../tests/support/sessionCheckoutWork.ts). A session in an isolated
// workspace, or one done before this one launched, shared nothing.
// ./ad-hoc-session-commits.spec.ts states what a session alone keeps.

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  adHocReview,
  launchDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { commitInCheckout } from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// Git logs each commit at its stated time, after any launch these cases make.
const firstAt = "2099-01-02T12:05:00Z";
const secondAt = "2099-01-02T12:10:00Z";

const secondsAgo = (seconds: number) =>
  new Date(Date.now() - seconds * 1000).toISOString();

test("two default launches open in one checkout both commit: either one's review holds the commits made while it was open and says the checkout was shared", async ({
  dashboard,
  origin,
  request,
}) => {
  const start = git(origin.project, "rev-parse", "HEAD");
  const first = await launchDefaultMainSession(dashboard, "Fix the typo");
  const second = await launchDefaultMainSession(dashboard, "Fix the link");
  await commitInCheckout(origin.project, firstAt, "typo.txt");
  const last = await commitInCheckout(origin.project, secondAt, "link.txt");
  const both = {
    kind: "session-commits",
    commitRuns: [expect.objectContaining({ commits: 2 })],
    baseline: start,
    tree: last,
  };
  dashboard.claudeSessionBecomes(first.session.sessionId, "working-idle");
  dashboard.claudeSessionBecomes(second.session.sessionId, "working-idle");

  // Done while the other session is still open.
  await markAdHocDone(dashboard, first.session.sessionId);

  expect(
    await adHocReview(request, dashboard, first.session.sessionId),
  ).toMatchObject({
    ...both,
    session: { shared: true },
  });

  // Done after the other session, which was open until its own Done.
  await markAdHocDone(dashboard, second.session.sessionId);

  expect(
    await adHocReview(request, dashboard, second.session.sessionId),
  ).toMatchObject({
    ...both,
    session: { shared: true },
  });
});

test("a session open meanwhile in an isolated workspace of the project does not share the Default main checkout", async ({
  dashboard,
  origin,
  request,
}) => {
  const isolated = path.join(origin.machine, "isolated-workspace");
  git(origin.project, "worktree", "add", "--quiet", "-b", "isolated", isolated);
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Isolated meanwhile" })
      .inIsolatedWorkspace({ workspace: isolated, branch: "isolated" })
      .inClaudeSession({ sessionId: "isolated-meanwhile" })
      .launchedAt(secondsAgo(60))
      .please(),
  ]);
  const record = await launchDefaultMainSession(dashboard, "Fix the typo");
  const { sessionId } = record.session;
  const committed = await commitInCheckout(origin.project, firstAt, "typo.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await markAdHocDone(dashboard, sessionId);

  const review = await adHocReview(request, dashboard, sessionId);
  expect(review).toMatchObject({ kind: "session-commits", tree: committed });
  expect(review).not.toHaveProperty("session.shared");
});

test("a session done in the Default main checkout before this one launched does not share it", async ({
  dashboard,
  origin,
  request,
}) => {
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Done before" })
      .inDefaultCheckout({
        workspace: origin.project,
        landing: "review",
        revision: git(origin.project, "rev-parse", "HEAD"),
      })
      .inClaudeSession({ sessionId: "done-before" })
      .launchedAt(secondsAgo(60))
      .markedDoneAt(secondsAgo(30))
      .please(),
  ]);
  const record = await launchDefaultMainSession(dashboard, "Fix the typo");
  const { sessionId } = record.session;
  const committed = await commitInCheckout(origin.project, firstAt, "typo.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await markAdHocDone(dashboard, sessionId);

  const review = await adHocReview(request, dashboard, sessionId);
  expect(review).toMatchObject({ kind: "session-commits", tree: committed });
  expect(review).not.toHaveProperty("session.shared");
});
