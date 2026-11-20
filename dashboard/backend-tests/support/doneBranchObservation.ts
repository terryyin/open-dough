// Done branches delivered on published trunk, as a revision observation of
// the project's trunk finds them.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aCheckout,
  anIsolatedLaunch,
  type Checkout,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "./doneCaptureCase.ts";

// The project and ref whose published revisions an observation reads.
export const observedTrunk = { id: source, ref: "main" };

// The tip of one commit adding `<name>.txt` in the checkout's worktree.
async function committedIn<Name extends string>(
  checkout: Checkout,
  workspace: string,
  name: Name,
) {
  const committed = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing(name, { at: minutesAgo(30) }),
  );
  return committed[name];
}

// Two kept Done branches, each with one commit adding `<branch>.txt` in its
// own worktree, merged by hand in that order into trunk, which is then
// published. Answers each branch's launch and tip, the merge of the first
// and the published head, which merges the second.
export async function twoDoneBranchesMergedByHand<
  First extends string,
  Second extends string,
>(first: First, second: Second) {
  const checkout = await aCheckout({
    history: historyBeforeTheCase()
      .withWorkspace(first, { from: "base" })
      .withWorkspace(second, { from: "base" }),
    withOrigin: true,
  });
  const firstWorkspace = checkout.execution;
  if (firstWorkspace === undefined)
    throw new Error(`Missing the ${first} worktree.`);
  // Further declared workspaces are linked under the checkout's .worktrees.
  const secondWorkspace = path.join(checkout.integration, ".worktrees", second);
  const firstRecord = anIsolatedLaunch(checkout, {
    workspace: firstWorkspace,
    branch: first,
  }).please();
  const secondRecord = anIsolatedLaunch(checkout, {
    workspace: secondWorkspace,
    branch: second,
  }).please();
  const home = keep(firstRecord, secondRecord);
  const firstTip = await committedIn(checkout, firstWorkspace, first);
  const secondTip = await committedIn(checkout, secondWorkspace, second);
  await markDone(firstRecord);
  await markDone(secondRecord);
  const { firstMerge, head } = await work(
    checkout,
    makeMe.aCheckoutWork
      .mergingTipByHand("firstMerge", { tip: firstTip, at: minutesAgo(5) })
      .mergingTipByHand("head", { tip: secondTip, at: minutesAgo(5) })
      .pushingToTrunk("pushed", { at: minutesAgo(5) }),
  );
  return {
    checkout,
    home,
    first: { record: firstRecord, tip: firstTip },
    second: { record: secondRecord, tip: secondTip },
    firstMerge,
    head,
  };
}
