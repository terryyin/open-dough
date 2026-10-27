// The selected supplier's current-consumer visit inside Trunk Mode `finish`.
// After the final closure is accepted, `finish` visits from the execution
// worktree and stops with that visit for the agent's judgment, keeping the
// worktree, branch and observer. Only `--visit-settled`, the last accepted SHA
// once the visit's owned publications finished or its unresolved work was
// retained, lets completion and retirement continue, for that SHA.
import { existsSync } from "node:fs";
import { visitSelectedSupplier } from "../../dough-execute-plan/scripts/supplier-integration.mjs";
import { isAncestor } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import { commitOf } from "./trunk-closure-settlement.mjs";

const keep = "the worktree, branch and observer stay";

// `{}` without a supplier; `{ finalSha }` for a settled visit; otherwise
// `stopped: "visit"` with the visit or the reason none could run.
export async function settledVisit({
  workspace,
  inspection,
  tracking,
  acceptedSha,
  supplierIdentity,
  visitSettled,
  targetRef,
  remote,
  backlogPath,
}) {
  if (!supplierIdentity) return {};
  if (visitSettled) {
    const finalSha = await commitOf(inspection, visitSettled);
    if (
      finalSha &&
      (await isAncestor(inspection, acceptedSha, finalSha)) &&
      (await isAncestor(inspection, finalSha, tracking))
    )
      return { finalSha };
    return {
      stopped: "visit",
      reason: `${tracking} holds no --visit-settled ${visitSettled} that contains the accepted final closure`,
      recovery: `name the last accepted SHA of this visit's publications, or the accepted final closure when it published none, as --visit-settled and rerun finish; ${keep}`,
    };
  }
  if (inspection !== workspace || !existsSync(workspace)) {
    return {
      stopped: "visit",
      reason:
        "execution worktree is absent, so no owned checkout can visit current consumers",
      recovery:
        "report the unfinished consumer visit with the accepted final closure; nothing here can establish its current consumers",
    };
  }
  const visit = visitSelectedSupplier({
    supplierIdentity,
    ownedWorkspace: workspace,
    acceptedSha,
    targetRef,
    remote,
    backlogPath,
  });
  const resume = `rerun finish with --final ${acceptedSha} and --visit-settled set to the last accepted SHA: a consumer publication, or ${acceptedSha} when none`;
  return {
    stopped: "visit",
    visit,
    recovery:
      visit.status === "visited"
        ? `judge each visited consumer under the supplier dependency procedure, publish owned consumer changes from this worktree through deliver on this coordinator's observer, and retain unresolved work in active context; then ${resume}; ${keep}`
        : `follow visit.recovery and rerun finish to visit again, or retain the unfinished visit and ${resume}; ${keep}`,
  };
}
