// Why Intent's Proof pane (`./IntentProof.tsx`) shows no observations for a
// selected file: Intent reads no proof for its kind yet (`./proofKinds.ts`),
// its location declares proof without a `runner` Intent reads it with, the
// project records no proof for its kind, naming the reference an agent in
// the project follows to record it, or its declared proof could not be read,
// with a Retry that reads it again.

import type {
  IntentLocation,
  IntentLocationProof,
} from "./authenticatedIntentRead.ts";
import {
  proofFamilies,
  proofRunners,
  unrecordedReferenceOf,
  type ProofKind,
} from "./proofKinds.ts";

// "a, b and c".
const listed = (items: readonly string[]) =>
  items.length < 2
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items.at(-1) ?? ""}`;

function RunnerProblem({ location }: { readonly location: IntentLocation }) {
  return (
    <p>
      {location.runnerProblem === "unsupported" &&
      location.runner !== undefined ? (
        <>
          <code>runner</code> <code>{location.runner}</code> is not a runner
          Intent reads proof for.
        </>
      ) : (
        <>
          <code>runner</code> is not declared for this location&rsquo;s proof.
        </>
      )}{" "}
      Set <code>runner</code> on <code>{location.path}</code> in{" "}
      <code>.planning/open-dough.json</code> to the runner that records its
      proof:{" "}
      {proofRunners.map((runner, at) => (
        <span key={runner}>
          {at > 0 ? " or " : null}
          <code>{runner}</code>
        </span>
      ))}
      .
    </p>
  );
}

export function NotRecorded({
  proofKind,
  location,
}: {
  readonly proofKind: ProofKind | undefined;
  readonly location?: IntentLocation | undefined;
}) {
  if (location?.runnerProblem !== undefined) {
    return <RunnerProblem location={location} />;
  }
  const reference =
    proofKind?.words.reference ??
    unrecordedReferenceOf(location?.kind, location?.runner);
  if (reference === undefined) {
    return (
      <p className="quiet">Proof is read for {listed(proofFamilies)} so far.</p>
    );
  }
  return (
    <p>
      Proof is not recorded for this project. To configure deliberate proof
      generation, follow <code>{reference}</code> in this project&rsquo;s
      installed Open Dough skills.
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
