// A selected completed supplier's integration: the history-preserving
// publication, then the current-consumer visit from the same owned workspace
// against its accepted revision. The accepted receipt stays the
// integration's; the visit reports the checkout it discovered from, or why
// that checkout could not become current.
import { resolve } from "node:path";
import { visitCurrentConsumers } from "../../dough-product-backlog/scripts/product-backlog-dependency-consumers.mjs";
import { defaultBacklogPath } from "../../dough-product-backlog/scripts/product-backlog-store.mjs";
import {
  publishHistoryPreservingCandidate,
  trunkTarget,
} from "./history-preserving-publication.mjs";

export async function integrateSelectedSupplier({
  supplierIdentity,
  ...publication
}) {
  const result = await publishHistoryPreservingCandidate(publication);
  if (result.classification === "preserved") return result;
  const {
    ownedWorkspace,
    targetRef = trunkTarget,
    remote = "origin",
    backlogPath = defaultBacklogPath,
  } = publication;
  let visit;
  try {
    visit = visitCurrentConsumers(resolve(ownedWorkspace, backlogPath), {
      "supplier-identity": supplierIdentity,
      "accepted-revision": result.acceptedSha,
      remote,
      target: targetRef,
    });
  } catch (error) {
    // The accepted receipt still stands; only the visit is unfinished.
    visit = {
      status: "stopped",
      reason: "error",
      error: error.message,
      recovery:
        "Clear the reported failure, then run product-backlog.mjs visit-consumers with this accepted revision.",
    };
  }
  return { ...result, visit };
}
