// A Done CI comparison's wall-time history, between its endpoints and its
// entry table (`./IntentCiComparisonContent.tsx`): a brief status of the
// history at the published Done landing, the compact prior-build readout and
// the shared dated chart through that landing, even when an equivalent or
// later build supplies its measurement. The comparison owns the local read
// (`useDoneWallTimeReading`) across its reading, failed, unavailable and shown
// states, so moving this view between them neither rereads nor discards it.
// A labelled icon refreshes it; a failed read keeps the last history of the
// same landing beside the shared panel's alert and short retry
// (`./IntentCiHistoryPanel.tsx`).
import { RefreshCw } from "lucide-react";
import { shortSha } from "./baseCiWording.ts";
import { isMeasured } from "./ciHistoryChart.ts";
import {
  doneStandInOf,
  doneWallTimeAvailabilityWords,
} from "./ciDoneWallTimeHistory.ts";
import { standInBuildWords } from "./ciHistoryWords.ts";
import { IconButton } from "./Icon.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import { IntentCiHistoryPanel } from "./IntentCiHistoryPanel.tsx";
import { IntentCiPriorBuildReference } from "./IntentCiPriorBuildReference.tsx";
import { doneWallTimeSeries } from "./landedCiHistorySeries.ts";
import { useIntentCiDoneWallTimeHistory } from "./useIntentCiDoneWallTimeHistory.ts";
import "./intent-ci-history.css";

export function useDoneWallTimeReading() {
  const evidence = useIntentCiEvidence();
  const selected =
    evidence.kind === "comparison" && evidence.phase === "done"
      ? evidence
      : undefined;
  const history = useIntentCiDoneWallTimeHistory(
    selected?.source,
    selected?.doneEndpoint,
    selected?.comparison.checkedAgain,
  );
  return selected === undefined
    ? undefined
    : {
        endpoint: selected.doneEndpoint,
        endpointReason: selected.doneEndpointReason,
        ...history,
      };
}

export type DoneWallTimeReading = ReturnType<typeof useDoneWallTimeReading>;

function waitingWords({
  endpoint,
  endpointReason,
}: NonNullable<DoneWallTimeReading>) {
  if (endpoint !== undefined)
    return `Reading collected CI wall time through ${shortSha(endpoint.revision)}…`;
  return endpointReason === undefined
    ? "Reading the selected story’s published landing…"
    : `${endpointReason} No prior-build reference can be established.`;
}

function standInWords(
  shown: NonNullable<NonNullable<DoneWallTimeReading>["shown"]>,
  endpoint: string | undefined,
) {
  const standIn =
    endpoint === undefined ? undefined : doneStandInOf(shown, endpoint);
  return standIn === undefined ? undefined : standInBuildWords[standIn];
}

export function IntentCiDoneWallTimeReference({
  reading,
}: {
  readonly reading: DoneWallTimeReading;
}) {
  if (reading === undefined) return null;
  const { endpoint, shown, failed, retry } = reading;
  const reference = shown?.reference;
  const series =
    shown === undefined || reference === undefined
      ? undefined
      : doneWallTimeSeries(shown.entries, reference);
  const status =
    shown === undefined
      ? undefined
      : doneWallTimeAvailabilityWords(shown.availability);
  return (
    <IntentCiHistoryPanel
      title="CI wall time history"
      status={status}
      action={
        endpoint !== undefined && (
          <IconButton
            label="Refresh history"
            icon={RefreshCw}
            onClick={retry}
          />
        )
      }
      failed={failed}
      retry={retry}
    >
      {shown === undefined || reference === undefined ? (
        failed === undefined && (
          <p className="intent-ci-history-note">{waitingWords(reading)}</p>
        )
      ) : (
        <IntentCiPriorBuildReference
          reference={reference}
          selectedNote={standInWords(shown, endpoint?.revision)}
        />
      )}
      {series?.builds.some(isMeasured) === true && (
        <IntentCiHistoryChart series={series} />
      )}
    </IntentCiHistoryPanel>
  );
}
