// Shared absent-Proof and location-problem wording for Intent's file Proof
// (`./IntentProof.tsx`) and location or folder Summary
// (`./IntentSummary.tsx`): undeclared proof, unreadable proof with retry, and
// an unusable location's explanation.

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
  locationProblem,
}: {
  // The selection's proof kind, undefined when Intent reads no proof for it.
  readonly proofKind: ProofKind | undefined;
  readonly proof: IntentLocationProof | undefined;
  readonly rereading: boolean;
  readonly onRetry: () => void;
  // The selection's location, whose kind and `runner` say which reference an
  // unrecorded proof names, or that the runner is the problem.
  readonly location?: IntentLocation | undefined;
  readonly locationProblem?: string;
}) {
  if (locationProblem !== undefined) {
    return <p className="intent-location-problem">{locationProblem}</p>;
  }
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
