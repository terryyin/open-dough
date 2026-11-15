import { useState } from "react";
import { recentUsagePeriod } from "./usagePeriod.ts";

function daysFromInput(input: string): number | undefined {
  const days = Number(input);
  return /^\d+$/.test(input) && recentUsagePeriod(days) !== undefined
    ? days
    : undefined;
}

export function UsageDays({
  days,
  onChoose,
}: {
  readonly days: number;
  readonly onChoose: (days: number) => void;
}) {
  const [input, setInput] = useState(String(days));
  const valid = daysFromInput(input) !== undefined;
  return (
    <label className="usage-days">
      Last N days
      <input
        className="frame-input"
        type="text"
        inputMode="numeric"
        value={input}
        aria-invalid={!valid}
        aria-describedby={!valid ? "usage-days-error" : undefined}
        onChange={(event) => {
          const value = event.target.value;
          setInput(value);
          const next = daysFromInput(value);
          if (next !== undefined) onChoose(next);
        }}
      />
      {!valid && (
        <span id="usage-days-error" role="alert">
          Enter a positive whole number of days. Showing the last {days} days.
        </span>
      )}
    </label>
  );
}
