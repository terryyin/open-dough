// One retained attempt's shared provenance and independently named readings.
import { shortSha } from "./baseCiWording.ts";
import { buildDateWords, standInBuildWords } from "./ciHistoryWords.ts";
import { declaredUnits, unitName } from "./ciProofUnits.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import type { ScopeHistoryEntry } from "./ciScopeHistory.ts";
import {
  scopeHistoryEndpointWords,
  scopeHistoryReason,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";

export function scopeHistoryProvenance(entry: ScopeHistoryEntry): string {
  const roles = new Set(
    entry.landings.map(
      (landing) => landing.provenance ?? entry.build?.provenance,
    ),
  );
  if (roles.size > 1)
    return entry.kind === "point" ? "Measured build" : "Build";
  const role = roles.values().next().value;
  return role === "later" || role === "equivalent"
    ? standInBuildWords[role]
    : "Exact build";
}

export function IntentScopeTimingHistoryEvidence({
  entry,
  context,
}: {
  readonly entry: ScopeHistoryEntry;
  readonly context: ScopeHistoryContext;
}) {
  const evidence = entry.build ?? entry.run;
  const readings = declaredUnits.flatMap((unit) =>
    entry.readings.filter((reading) => reading.unit === unit),
  );
  return (
    <li>
      <time dateTime={entry.date}>{buildDateWords(entry.date)}</time>
      {" · "}
      {readings.length === 0 && entry.kind === "gap"
        ? entry.reason === undefined
          ? undefined
          : scopeHistoryReason(context, entry.reason)
        : readings.map((reading, index) => (
            <span key={reading.unit}>
              {index > 0 && " · "}
              {reading.kind === "point"
                ? `${executionTimeWords(reading.ms)} · ${unitName(reading.unit)} · entry ${reading.entry}`
                : `${unitName(reading.unit)} · ${scopeHistoryReason(context, reading.reason)}`}
            </span>
          ))}
      {entry.legacyReason !== undefined &&
        (entry.kind === "point" ||
          readings.length > 0 ||
          entry.legacyReason !== entry.reason) && (
          <>
            {" · "}
            {entry.legacyReason}
          </>
        )}
      {entry.selected && (
        <strong> · {scopeHistoryEndpointWords(context)}</strong>
      )}
      {entry.build !== undefined && (
        <>
          {` · ${scopeHistoryProvenance(entry)} `}
          <code>{shortSha(entry.build.revision)}</code>
        </>
      )}
      {evidence !== undefined && <HistoryRunAttempt run={evidence} />}
      {" · Represents "}
      {entry.landings.map((landing, index) => (
        <span key={`${landing.revision}#${landing.receivedAt}`}>
          {index > 0 && ", "}
          <code>{shortSha(landing.revision)}</code>
          {landing.selected &&
            ` (${scopeHistoryEndpointWords(context).toLowerCase()})`}
          {landing.provenance === "exact" && " (exact build)"}
          {landing.provenance === "equivalent" && " (reused equivalent build)"}
          {landing.provenance === "later" &&
            " (later trunk build, includes later changes)"}
        </span>
      ))}
    </li>
  );
}
