// A Dashboard admission can use an owned claim checkout while the native
// session runs in a borrowed checkout. Transfer its accepted evidence only
// when finishing that claim, without changing the borrowed checkout.
import { existsSync, realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ownershipHold } from "../../dough-land/scripts/retirement-checks.mjs";
import { parseBacklog } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { doneRecordFileName } from "../../dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { readRetainedLandingComparison } from "../../dough-execute-plan/scripts/dashboard-landing.mjs";
import {
  readSessionEvidence,
  retainAdmittedSession,
} from "../../dough-execute-plan/scripts/execution-session-evidence.mjs";
import { firstLandingExpected } from "../../dough-execute-plan/scripts/first-landing-expectation.mjs";
import { validateRetainedComparison } from "../../dough-execute-plan/scripts/publication-comparison.mjs";
import { managementContext } from "../../dough-execute-plan/scripts/publication-git.mjs";
import { readSharedCheckoutNote } from "../../dough-execute-plan/scripts/read-shared-checkout-note.mjs";
import { isSessionId } from "../../dough-execute-plan/scripts/session-record.mjs";
import { rangeUncertainty } from "../../dough-execute-plan/scripts/shared-checkout-note.mjs";
import {
  backlogPath as defaultBacklogPath,
  fileAt,
  isAncestor,
} from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

export function admittedRefreshCheckout(checkout, borrowed) {
  if (!checkout || !borrowed) return checkout;
  if (checkout === borrowed) return undefined;
  return existsSync(checkout) &&
    existsSync(borrowed) &&
    realpathSync(checkout) === realpathSync(borrowed)
    ? undefined
    : checkout;
}

export async function adoptAdmittedSession({
  admittedLaunchContext,
  workspace,
  branch,
  identity,
  repository,
  remote,
  targetRef,
  tracking,
  beforeCleanup,
  final,
  backlogPath = defaultBacklogPath,
}) {
  const file = admittedLaunchContext;
  const context = await readJson(file);
  const claim = await readJson(join(dirname(file), "admitted-claim.json"));
  if (
    !isSessionId(context.reference) ||
    !identity ||
    context.identity !== identity ||
    context.remote !== remote ||
    context.target !== targetRef ||
    claim.reference !== context.reference ||
    claim.admission.workspace !== workspace ||
    claim.admission.branch !== branch ||
    claim.nativeWorkspace === workspace
  ) {
    throw new Error("The Dashboard admission does not name this owned claim.");
  }
  if (!existsSync(workspace)) return claim.nativeWorkspace;
  if (
    (await managementContext(claim.nativeWorkspace)) !== repository ||
    (await ownershipHold(workspace, identity, false)) ||
    !(await isAncestor(workspace, claim.admission.publishedSha, tracking)) ||
    !(await isAncestor(workspace, claim.admission.publishedSha, branch))
  ) {
    throw new Error(
      "The published claim or its checkout ownership could not be verified.",
    );
  }
  const donePath = join(
    dirname(backlogPath),
    "done",
    doneRecordFileName(identity),
  );
  const done = await fileAt(workspace, final, donePath);
  const backlog = await fileAt(workspace, final, backlogPath);
  if (
    !done ||
    JSON.parse(done).identity !== identity ||
    !backlog ||
    parseBacklog(backlog).entries.some((entry) => entry.identity === identity)
  ) {
    throw new Error(
      "The final closure must record the admitted story as Done.",
    );
  }

  const kept = readSessionEvidence(workspace);
  const adopted =
    kept?.sessionId === context.reference && kept.story === identity;
  let landed;
  try {
    landed = await readRetainedLandingComparison(file, context);
    if (landed === undefined) {
      // A no-change closure starts with an open first-landing expectation.
      // After it publishes its one closure range, retry can retire it.
      const closedWithoutLanding =
        adopted && kept.closedAt && kept.ranges.length === 1;
      if (
        beforeCleanup !== claim.admission.publishedSha ||
        (!closedWithoutLanding && !(await firstLandingExpected(file)))
      )
        throw new Error("The retained landing is missing.");
    } else {
      const { base, candidate } = landed;
      await validateRetainedComparison(workspace, candidate, base);
      if (
        !(await isAncestor(workspace, claim.admission.publishedSha, base)) ||
        !(await isAncestor(workspace, candidate, beforeCleanup))
      )
        throw new Error(
          "The native comparison is outside its published claim.",
        );
    }
  } catch (cause) {
    throw new Error(
      "The native landing has no matching accepted session range.",
      {
        cause,
      },
    );
  }
  if (adopted) {
    if (
      landed !== undefined &&
      (kept.ranges[0]?.base !== landed.base ||
        kept.ranges[0]?.candidate !== landed.candidate)
    )
      throw new Error(
        "The native landing has no matching accepted session range.",
      );
    return claim.nativeWorkspace;
  }
  if (kept?.story !== identity || kept.closedAt || kept.ranges.length !== 0)
    throw new Error(
      "This checkout has different session evidence to preserve.",
    );

  const ranges = [];
  if (landed) {
    const { base, candidate, acceptedAt } = landed;
    const uncertainty = rangeUncertainty(
      await readSharedCheckoutNote(file),
      acceptedAt,
    );
    ranges.push({ base, candidate, ...(uncertainty && { uncertainty }) });
  }
  retainAdmittedSession(workspace, {
    sessionId: context.reference,
    story: identity,
    ranges,
  });
  return claim.nativeWorkspace;
}
