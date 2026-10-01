// Unknown native creation is reachable after page loss without pretending
// that this machine knows a session ID or current native activity.
import { type CreationView, creationCommand } from "./launchCreation.ts";
export function CreationEntry({ record }: { readonly record: CreationView }) {
  const command = creationCommand(record);
  return (
    <article
      className="launch-problem"
      aria-label={`${record.request.title} unresolved creation`}
    >
      <p>Conversation creation in {record.recovery.hostName} unresolved</p>
      <p>
        {record.request.title}
        {"identity" in record.request && <> · {record.request.identity}</>}
      </p>
      <p>
        No trustworthy conversation ID was returned. First input was not
        submitted.
      </p>
      <p>
        Workspace <code>{record.creation.workspace}</code>
      </p>
      {command === undefined ? (
        <p>
          Native history inspection is unavailable for{" "}
          {record.recovery.hostName}.
        </p>
      ) : (
        <p>
          Inspect native history: <code>{command}</code>
        </p>
      )}
      <p>
        Reconcile this machine's launch evidence with native history before
        starting again.
      </p>
    </article>
  );
}
