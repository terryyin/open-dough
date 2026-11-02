// One judgment as Intent's CI status tab shows it (`./IntentCiStatus.tsx`):
// the state with the judged revision, the branch the run was on when it is
// not the judged one, later commits without their own result, the reason,
// the run link, and a running judgment's nearest completed ancestor; a
// branch GitHub does not publish says so instead. Wording is shared with the
// launch's base-CI confirmation (`./baseCiWording.ts`).

import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import {
  completedAncestorLine,
  judgedStateName,
  laterWithoutResultLine,
  noCompletedAncestorLine,
  shortSha,
} from "./baseCiWording.ts";

function RunLink({ url }: { readonly url: string | undefined }) {
  if (url === undefined) return null;
  return (
    <p>
      Run:{" "}
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    </p>
  );
}

// The branch a result's run was on, named only when it is not the judged
// branch.
function otherRunBranch(
  judged: string,
  run: string | undefined,
): string | undefined {
  return run === judged ? undefined : run;
}

export function ShownJudgment({
  judgment,
  story,
}: {
  readonly judgment: Judgment;
  // The selected story whose branch is judged, if any.
  readonly story: string | undefined;
}) {
  const { completedAncestor } = judgment;
  // Only a story branch is unpublished; the trunk's 404 is unread.
  if (judgment.unpublished === true && story !== undefined) {
    return (
      <p className="intent-ci-gap">
        {`The recorded branch ${judgment.branch} of ${story} is no longer published, so it has no CI status.`}
      </p>
    );
  }
  const later = laterWithoutResultLine(judgment.laterWithoutResult);
  const runBranch = otherRunBranch(judgment.branch, judgment.runBranch);
  const ancestorRunBranch = otherRunBranch(
    judgment.branch,
    completedAncestor?.runBranch,
  );
  return (
    <>
      <p className="intent-ci-state" data-state={judgment.state}>
        {judgedStateName(judgment.state)}
        {judgment.revision === "unavailable" ? (
          ""
        ) : (
          <>
            {" at "}
            <code>{shortSha(judgment.revision)}</code> ({judgment.subject})
            {runBranch !== undefined && (
              <>
                , run on <code>{runBranch}</code>
              </>
            )}
          </>
        )}
      </p>
      {later !== "" && <p>{later}</p>}
      {judgment.reason !== undefined && (
        <p className="intent-ci-reason">{judgment.reason}</p>
      )}
      <RunLink url={judgment.runUrl} />
      {judgment.state === "running" &&
        (completedAncestor === undefined ? (
          <p>{noCompletedAncestorLine}</p>
        ) : (
          <>
            <p>
              {completedAncestorLine(completedAncestor)}
              {ancestorRunBranch !== undefined && (
                <>
                  {" "}
                  Run on <code>{ancestorRunBranch}</code>.
                </>
              )}
            </p>
            <RunLink url={completedAncestor.runUrl} />
          </>
        ))}
    </>
  );
}
