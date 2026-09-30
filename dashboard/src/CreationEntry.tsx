// Unknown native creation is reachable after page loss without pretending
// that this machine knows a session ID or current native activity.
import { type CreationRecord, creationCommand } from "./launchCreation.ts";
import { hostName } from "./sessionCapabilities.ts";
export function CreationEntry({ record }: { readonly record: CreationRecord }) {
  return (
    <article
      className="launch-problem"
      aria-label={`${record.request.title} unresolved creation`}
    >
      <p>Conversation creation in {hostName(record.request.host)} unresolved</p>
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
      <p>
        Inspect native history: <code>{creationCommand(record)}</code>
      </p>
      <p>
        Reconcile this machine's launch evidence with native history before
        starting again.
      </p>
    </article>
  );
}
