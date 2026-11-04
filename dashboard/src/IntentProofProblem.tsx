// Why Intent's Proof pane (`./IntentProof.tsx`) shows no observations for a
// selected file: the project records no proof for its kind, naming the
// reference an agent in the project follows to record it
// (`./proofKinds.ts`), or its declared
// proof could not be read, with a Retry that reads it again.

import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { proofKindOf } from "./proofKinds.ts";

export function NotRecorded({ kind }: { readonly kind: string | undefined }) {
  const proofKind = proofKindOf(kind);
  if (proofKind === undefined) {
    return (
      <p className="quiet">
        Intent reads Proof only for Gherkin feature files so far.
      </p>
    );
  }
  return (
    <p>
      Proof is not recorded for this project. To configure deliberate proof
      generation, follow <code>{proofKind.words.reference}</code> in this
      project&rsquo;s installed Open Dough skills.
    </p>
  );
}

export function ProofProblem({
  proof,
  onRetry,
}: {
  readonly proof: Extract<IntentLocationProof, { problem: unknown }>;
  readonly onRetry: () => void;
}) {
  const because =
    proof.file === undefined
      ? `${proof.path} could not be listed at this revision`
      : proof.problem === "malformed"
        ? `${proof.file} is not a valid proof file`
        : `${proof.file} could not be read at this revision`;
  return (
    <p className="intent-file-problem" role="alert">
      Proof could not be read: {because}.{" "}
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}
