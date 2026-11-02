// The selected Intent location's project-owned recording instruction, shared
// by file Proof and location/folder summaries. Missing configuration never
// hides readable historical proof.

import type { IntentLocation } from "./authenticatedIntentRead.ts";

export function IntentProofGeneration({
  location,
}: {
  readonly location: IntentLocation | undefined;
}) {
  if (location?.kind !== "gherkin" || location.problem !== undefined) {
    return null;
  }
  const generation = location.proofGeneration;
  return (
    <>
      {location.proof !== undefined ? (
        <p className="quiet">
          Proof is a published snapshot. Generate or refresh it deliberately;
          normal test runs leave it untouched. Observations may come from
          different runs and do not establish present product health.
        </p>
      ) : null}
      {generation === undefined ? (
        location.proof !== undefined ? (
          <p>
            {location.proofGenerationProblem === "malformed"
              ? "Proof generation is invalid."
              : "Proof generation is not configured."}{" "}
            Set <code>proofGeneration</code> on <code>{location.path}</code> in{" "}
            <code>.planning/open-dough.json</code> to exactly one command or
            skill for generating or refreshing proof.
          </p>
        ) : null
      ) : "command" in generation ? (
        <p>
          Generate or refresh proof from the repository root:{" "}
          <code>{generation.command}</code>
        </p>
      ) : (
        <p>
          Generate or refresh proof with this project&rsquo;s skill:{" "}
          <code>{generation.skill}</code>
        </p>
      )}
    </>
  );
}
