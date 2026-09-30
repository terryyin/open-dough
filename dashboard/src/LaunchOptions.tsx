// The options a launch dialog offers: one checkbox per entry, each with its
// label, flag and summary. The dialog owns which are selected.

import type { OfferedOption } from "./commandOptions.ts";

export function LaunchOptions({
  id,
  options,
  hint,
  selected,
  onToggle,
}: {
  readonly id: string;
  readonly options: readonly OfferedOption[];
  readonly hint?: string | undefined;
  readonly selected: ReadonlySet<string>;
  readonly onToggle: (flag: string, chosen: boolean) => void;
}) {
  return (
    <fieldset className="launch-options">
      <legend>Options</legend>
      {hint !== undefined && <p className="quiet">{hint}</p>}
      {options.map(({ flag, label, summary }) => (
        <div key={flag} className="launch-option">
          <input
            type="checkbox"
            id={`${id}-option${flag}`}
            aria-describedby={`${id}-summary${flag}`}
            checked={selected.has(flag)}
            onChange={(event) => {
              onToggle(flag, event.target.checked);
            }}
          />
          <label htmlFor={`${id}-option${flag}`}>{label}</label>
          <code>{flag}</code>
          <span id={`${id}-summary${flag}`} className="quiet">
            {summary}
          </span>
        </div>
      ))}
    </fieldset>
  );
}
