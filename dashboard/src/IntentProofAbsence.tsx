// Absent-Proof wording for Intent's file Proof (`./IntentProof.tsx`):
// undeclared proof, and unreadable proof with retry.

import type {
  IntentLocation,
  IntentLocationProof,
} from "./authenticatedIntentRead.ts";
import { NotRecorded, ProofProblem } from "./IntentProofProblem.tsx";
import type { ProofKind } from "./proofKinds.ts";

export function IntentProofAbsence({
  proofKind,
  proof,
  rereading,
  onRetry,
  location,
}: {
  // The selection's proof kind, undefined when Intent reads no proof for it.
  readonly proofKind: ProofKind | undefined;
  readonly proof: IntentLocationProof | undefined;
  readonly rereading: boolean;
  readonly onRetry: () => void;
  // The selection's location, whose kind and `runner` say which reference an
  // unrecorded proof names, or that the runner is the problem.
  readonly location?: IntentLocation | undefined;
}) {
  if (proof === undefined) {
    return <NotRecorded proofKind={proofKind} location={location} />;
  }
  if ("problem" in proof) {
    return rereading ? (
      <p className="quiet">Reading Proof in {proof.path}…</p>
    ) : (
      <ProofProblem proof={proof} onRetry={onRetry} />
    );
  }
  return null;
}
