// Why Intent's Proof pane (`./IntentProof.tsx`) shows no observations for a
// selected file: the project records no proof for its kind, naming the
// reference an agent in the project follows to record it, or its declared
// proof could not be read, with a Retry that reads it again.

import type { IntentLocationProof } from "./authenticatedIntentRead.ts";

// Where an agent in this project finds how to record proof: the reference
// as its installed Open Dough skills hold it.
const cucumberProofReference =
  "dough-test-optimization/references/cucumber-proof.md";

export function NotRecorded({ kind }: { readonly kind: string | undefined }) {
  if (kind !== "gherkin") {
    return (
      <p className="quiet">
        Intent reads Proof only for Gherkin feature files so far.
      </p>
    );
  }
  return (
    <p>
      Proof is not recorded for this project. To record it, follow{" "}
      <code>{cucumberProofReference}</code> in this project&rsquo;s installed
      Open Dough skills.
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
