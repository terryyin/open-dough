// First-input delivery of kept launch records: which session entries became
// delivered in a rewrite, and the listener that rewrite notifies once it has
// landed (`./storyNoteDelivery.ts` marks attached note versions). Absent
// firstInput (Claude) or `confirmed` means delivered; `uncertain` / `awaiting`
// do not. The document writer (`./launchRecordDocument.ts`) computes and
// surfaces the entries; this module holds the rule and the listener.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";

export type DeliveredRecordEntry = {
  readonly project: string;
  readonly record: LaunchRecord;
};

export type RecordsDelivered = (
  entries: readonly DeliveredRecordEntry[],
) => Promise<void>;

let recordsDelivered: RecordsDelivered | undefined;

export function onRecordsDelivered(listener: RecordsDelivered): void {
  recordsDelivered = listener;
}

function firstInputDelivered(record: LaunchRecord): boolean {
  return (
    record.firstInput === undefined || record.firstInput.state === "confirmed"
  );
}

function entryKey({ project, record }: DeliveredRecordEntry): string {
  return `${project}\0${sessionKey(record.session)}`;
}

export function newlyDeliveredEntries(
  prior: readonly DeliveredRecordEntry[],
  next: readonly DeliveredRecordEntry[],
): DeliveredRecordEntry[] {
  const beforeByKey = new Map(
    prior.map((entry) => [entryKey(entry), entry.record]),
  );
  return next.filter((entry) => {
    if (!firstInputDelivered(entry.record)) return false;
    const before = beforeByKey.get(entryKey(entry));
    return before === undefined || !firstInputDelivered(before);
  });
}

export async function notifyRecordsDelivered(
  leftAsIs: boolean,
  delivered: readonly DeliveredRecordEntry[],
): Promise<void> {
  if (!leftAsIs && delivered.length > 0) {
    await recordsDelivered?.(delivered);
  }
}
