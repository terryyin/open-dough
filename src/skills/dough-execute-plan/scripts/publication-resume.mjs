// Git mechanics (not guidance-following) for
// publish-the-candidate.md "Resume an interrupted publication".
// One classification shared by execution and preparation proofs.
// Native agent recovery is not this module.
import {
  captureCheckout,
  git,
  maintenanceFromInspection,
  pushCandidate,
  revParse,
} from "./publication-test-fixtures.mjs";

async function isAncestor(workspace, ancestor, descendant) {
  try {
    await git(workspace, "merge-base", "--is-ancestor", ancestor, descendant);
    return true;
  } catch {
    return false;
  }
}

function hasReceipt(observer, sha) {
  return (
    observer?.bound === true &&
    observer.receipts.some(
      (receipt) => receipt.sha === sha && receipt.target === "refs/heads/main",
    )
  );
}

async function ownedCommitIdentity(workspace) {
  return {
    head: await revParse(workspace, "HEAD"),
    count: Number(
      (await git(workspace, "rev-list", "--count", "HEAD")).stdout.trim(),
    ),
  };
}

function appendIdentity(publishedRevisions, sha) {
  if (!publishedRevisions.includes(sha)) {
    publishedRevisions.push(sha);
    return true;
  }
  return false;
}

// Classifies the retained candidate and completes the first unfinished
// publication obligation. Does not commit, refresh the default checkout,
// or remove a workspace. `candidateSha` is the SHA retained immediately
// before the push; after a rewrite that is the rewritten SHA.
// `supersededShas` are pre-rebase identities and are never pushed.
export async function resumeInterruptedPublication({
  ownedWorkspace,
  defaultCheckout,
  candidateSha,
  supersededShas = [],
  publishedRevisions,
  observer = null,
}) {
  if (supersededShas.includes(candidateSha)) {
    throw new Error(
      "retained candidate must be the rewritten SHA, not a pre-rebase SHA",
    );
  }

  const preserved = await ownedCommitIdentity(ownedWorkspace);
  await git(ownedWorkspace, "fetch", "origin");
  const accepted = await isAncestor(
    ownedWorkspace,
    candidateSha,
    "origin/main",
  );

  if (!accepted) {
    await pushCandidate(ownedWorkspace, candidateSha);
    await git(ownedWorkspace, "fetch", "origin");
    if (!(await isAncestor(ownedWorkspace, candidateSha, "origin/main"))) {
      throw new Error("push did not accept the retained candidate");
    }
    assertOwnedCommitsPreserved(
      preserved,
      await ownedCommitIdentity(ownedWorkspace),
    );
    appendIdentity(publishedRevisions, candidateSha);
    const registration = registerIfBound(observer, candidateSha);
    const maintenance = await inspectMaintenance(
      ownedWorkspace,
      defaultCheckout,
    );
    return {
      classification: "not-on-remote",
      completedObligation: "publish",
      pushCount: 1,
      acceptedSha: candidateSha,
      acceptedPublicationCount: publishedRevisions.length,
      registration,
      maintenance,
      cleanup: "not-performed",
      preservedHead: preserved.head,
      preservedCommitCount: preserved.count,
      remaining: remainingAfter(observer, candidateSha, maintenance),
    };
  }

  for (const stale of supersededShas) {
    if (await isAncestor(ownedWorkspace, stale, "origin/main")) {
      throw new Error("a pre-rebase SHA must not be the published candidate");
    }
  }

  assertOwnedCommitsPreserved(
    preserved,
    await ownedCommitIdentity(ownedWorkspace),
  );
  const identityAppended = appendIdentity(publishedRevisions, candidateSha);
  const maintenance = await inspectMaintenance(ownedWorkspace, defaultCheckout);
  const published = {
    classification: "already-published",
    pushCount: 0,
    acceptedSha: candidateSha,
    acceptedPublicationCount: publishedRevisions.length,
    maintenance,
    cleanup: "not-performed",
    preservedHead: preserved.head,
    preservedCommitCount: preserved.count,
  };

  if (identityAppended) {
    return {
      ...published,
      completedObligation: "record-published-identity",
      registration: observer?.bound
        ? { attempted: false, reason: "not-this-obligation" }
        : { attempted: false, reason: "no-observer" },
      remaining: remainingAfter(observer, candidateSha, maintenance),
    };
  }

  if (observer?.bound === true && !hasReceipt(observer, candidateSha)) {
    return {
      ...published,
      completedObligation: "register",
      registration: registerIfBound(observer, candidateSha),
      remaining: remainingAfter(observer, candidateSha, maintenance),
    };
  }

  return {
    ...published,
    completedObligation: "none",
    registration: observer?.bound
      ? { attempted: false, reason: "already-recorded" }
      : { attempted: false, reason: "no-observer" },
    remaining: remainingAfter(observer, candidateSha, maintenance),
  };
}

function assertOwnedCommitsPreserved(before, after) {
  if (after.head !== before.head || after.count !== before.count) {
    throw new Error("resume duplicated or moved the owned commit");
  }
}

async function inspectMaintenance(ownedWorkspace, defaultCheckout) {
  const remoteTip = await revParse(ownedWorkspace, "origin/main");
  const checkout = await captureCheckout(defaultCheckout);
  return maintenanceFromInspection(
    { head: checkout.head, status: checkout.status },
    remoteTip,
  );
}

function registerIfBound(observer, sha) {
  if (!observer?.bound) {
    return { attempted: false, reason: "no-observer" };
  }
  observer.register(sha);
  return { attempted: true, sha, target: "refs/heads/main" };
}

function remainingAfter(observer, sha, maintenance) {
  return {
    registration: !observer?.bound
      ? "not-applicable"
      : hasReceipt(observer, sha)
        ? "satisfied"
        : "remaining",
    maintenance,
    maintenancePerformed: false,
    cleanup: "not-performed",
  };
}
