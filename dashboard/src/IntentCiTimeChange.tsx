// A story CI comparison's signed elapsed-time change with its relative mark
// (`./IntentCiComparison.tsx`): the change in words, readable without color,
// then a mark whose zero sits at its centre, faster extending left and slower
// right on the one scale the comparison shares
// (`./storyCiRelativeChange.ts`), then, while **Show %** is on, the relative
// change as a percentage. A change without a positive baseline shows its
// words alone. Outside a comparison's scale, a change shows its words alone.

import { createContext, useContext } from "react";
import { relativePercentWords } from "./ciProofTimeWords.ts";
import {
  relativeDirectionOf,
  relativeReachOf,
  type TimeChange,
} from "./storyCiRelativeChange.ts";
import "./intent-ci-time-change.css";

// The comparison's shared relative scale and whether percentages show.
type RelativeTiming = {
  readonly scale: number;
  readonly showPercent: boolean;
};

const RelativeTimingContext = createContext<RelativeTiming | undefined>(
  undefined,
);

export const RelativeTimingProvider = RelativeTimingContext;

function RelativeMark({
  relative,
  scale,
}: {
  readonly relative: number;
  readonly scale: number;
}) {
  const reach = relativeReachOf(relative, scale);
  return (
    <span
      className="intent-ci-time-mark"
      data-direction={relativeDirectionOf(relative)}
      aria-hidden="true"
    >
      <span className="intent-ci-time-zero" />
      <span
        className="intent-ci-time-bar"
        style={{ width: `${String(reach * 50)}%` }}
      />
    </span>
  );
}

export function TimeChangeFigure({ change }: { readonly change: TimeChange }) {
  const timing = useContext(RelativeTimingContext);
  if (timing === undefined) return <>{change.text}</>;
  const { relative } = change;
  return (
    <span className="intent-ci-time-change">
      <span className="intent-ci-time-delta">{change.text}</span>
      {relative !== undefined && (
        <RelativeMark relative={relative} scale={timing.scale} />
      )}
      {relative !== undefined && timing.showPercent && (
        <span className="intent-ci-time-percent">
          {relativePercentWords(relative)}
        </span>
      )}
    </span>
  );
}

// The scale's directions and the **Show %** choice, off until chosen.
export function RelativeTimingControls({
  showPercent,
  onShowPercent,
}: {
  readonly showPercent: boolean;
  readonly onShowPercent: (show: boolean) => void;
}) {
  return (
    <div className="intent-ci-time-controls">
      <span className="intent-ci-time-scale">
        ← Faster <span aria-hidden="true">·</span> Slower →
      </span>
      <label className="intent-ci-percent-switch">
        <input
          type="checkbox"
          checked={showPercent}
          onChange={(event) => {
            onShowPercent(event.target.checked);
          }}
        />{" "}
        Show %
      </label>
    </div>
  );
}
