import { shortSha } from "./baseCiWording.ts";
import { SelectedBuildIdentity } from "./IntentCiComparisonEndpoints.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";

export function UncommittedCiNote() {
  const { uncommittedCi } = useIntentCiEvidence();
  if (uncommittedCi === undefined) return null;
  const head = (
    <code title={uncommittedCi.head}>{shortSha(uncommittedCi.head)}</code>
  );
  return (
    <p className="intent-ci-gap">
      Uncommitted changes were not measured by CI.{" "}
      {uncommittedCi.kind === "build" ? (
        <>
          Last committed build{" "}
          <SelectedBuildIdentity
            slot={uncommittedCi.build}
            showSource={false}
          />
          .
        </>
      ) : uncommittedCi.kind === "checking" ? (
        <>Checking CI for the last commit {head}…</>
      ) : uncommittedCi.kind === "unavailable" ? (
        <>CI for the last commit {head} could not be read.</>
      ) : (
        <>No completed CI build was found for the last commit {head}.</>
      )}
    </p>
  );
}
