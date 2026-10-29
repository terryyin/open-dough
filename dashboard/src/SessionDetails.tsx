// Routine launch facts disclosed by a Session entry. Attention and failures
// remain in SessionEntry so closing these details cannot hide them.
import {
  establishedPlace,
  launchSubject,
  type LaunchWithState,
} from "./agentLaunch.ts";
import type { AgentAssignment } from "./agentAssignments.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { SessionAssignment } from "./SessionAssignment.tsx";
import { sessionAccess } from "./sessionAccess.ts";
import {
  hostName,
  marksDone,
  marksLocalDone,
  shellCommand,
} from "./sessionCapabilities.ts";
import { usePageSessions } from "./pageSessions.ts";

export function SessionDetails({
  record,
  say,
  storyCardAssignments,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
  readonly storyCardAssignments?: readonly AgentAssignment[] | undefined;
}) {
  const { startedWords, optionsWords, policyWords } = launchSubject(
    record.request,
  );
  const { hostOperations } = usePageSessions();
  // A local-only Done attempts no native naming, so it claims none.
  const nativelyNamed =
    !marksLocalDone(hostOperations, record.session.host) &&
    (record.completion === undefined ||
      marksDone(hostOperations, record.session.host));
  const markedDone = record.doneAt !== undefined;
  return (
    <>
      <p>
        {record.firstInput !== undefined &&
        record.firstInput.state !== "confirmed"
          ? `Conversation created in ${hostName(record.session.host)}`
          : startedWords}{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <SessionAssignment
        record={record}
        storyCardAssignments={storyCardAssignments}
      />
      {optionsWords !== undefined && <p>{optionsWords}</p>}
      {policyWords !== undefined && <p>{policyWords}</p>}
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      {markedDone && nativelyNamed && (
        <p>
          {record.doneProblem === undefined ? "Named" : "Intended name"}{" "}
          <code>{doneSessionName(record.session)}</code>
        </p>
      )}
      <LaunchSessionDetails record={record} say={say} />
    </>
  );
}

// Routine launch evidence belongs in Session details. Workspace is named once,
// preferring its projected display path and retaining exact native continuation.
function LaunchSessionDetails({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { hostOperations } = usePageSessions();
  const access = sessionAccess(record, hostOperations);
  const continuation =
    "continuation" in record.session ? record.session.continuation : undefined;
  const established = establishedPlace(record);
  const workspace =
    record.shownWorkspace ?? continuation?.workspace ?? established?.workspace;
  const defaultMain =
    established !== undefined &&
    "role" in established &&
    established.role === "default-checkout";
  const command =
    continuation === undefined ? undefined : shellCommand(continuation.args);
  return (
    <>
      <p>
        Session <code>{record.session.sessionId}</code>
      </p>
      {workspace !== undefined && (
        <p>
          Workspace <code>{workspace}</code>
          {defaultMain && " (default main)"}
        </p>
      )}
      {"continuation" in record.session &&
        record.session.continuation !== undefined && (
          <>
            {access === "terminal" && command !== undefined && (
              <p>
                Continue in {hostName(record.session.host)}:{" "}
                <code>{command}</code>
                <button
                  type="button"
                  className="session-copy-command frame-button"
                  onClick={() => {
                    say(undefined);
                    const refused = () => {
                      say(
                        "The resume command could not be copied. Select it in Session details.",
                      );
                    };
                    const clipboard =
                      "clipboard" in navigator
                        ? navigator.clipboard
                        : undefined;
                    const copying = clipboard?.writeText(command);
                    if (copying === undefined) refused();
                    else
                      void copying.then(() => {
                        say("Resume command copied.");
                      }, refused);
                  }}
                >
                  Copy resume command
                </button>
              </p>
            )}
            {record.firstInput?.state === "confirmed" && (
              <p>First input accepted</p>
            )}
            {record.firstInput?.intent === "blank" &&
              record.firstInput.state === "not-requested" && (
                <p>Opened without an instruction</p>
              )}
          </>
        )}
    </>
  );
}
