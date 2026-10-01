// The options a launch dialog offers, behind a disclosure whose summary names
// the selected entries and their count, or "None selected", open or closed:
// a checkbox per entry outside any group and, per exclusive group, a fieldset
// of radios with a "No <group>" choice, each entry with its label and summary;
// the flags a selection sends are the dialog's command line. The dialog owns
// which are selected; a group's rule is the shared model's (`withChoice`).

import { useState, type ReactNode } from "react";
import {
  withChoice,
  withoutGroup,
  type OfferedOption,
  type OfferedShape,
} from "./commandOptions.ts";

type Group = OfferedShape["groups"][number];

type Item =
  | { readonly option: OfferedOption }
  | { readonly group: Group; readonly members: readonly OfferedOption[] };

// The entries as a dialog lays them out, in the definition's order: a free
// entry, or a group at the place of its first member.
function layout({ options, groups }: OfferedShape): Item[] {
  const laidOut = new Set<string>();
  return options.flatMap((option): Item[] => {
    const group = groups.find(({ flags }) => flags.includes(option.flag));
    if (group === undefined) return [{ option }];
    if (laidOut.has(group.id)) return [];
    laidOut.add(group.id);
    return [
      {
        group,
        members: options.filter(({ flag }) => group.flags.includes(flag)),
      },
    ];
  });
}

// A dialog's selection of `options`, starting from a failed launch's
// (`kept`), changed by group rule (`choose`, `clearGroup`): the flags it
// sends, in the order offered, and the line saying which selected flags the
// offer no longer has, else `notOfferedLine`.
export function useOptionSelection(
  options: OfferedShape | undefined,
  kept: ReadonlySet<string> | undefined,
  reading: boolean,
  notOfferedLine: string | undefined,
) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    kept ?? new Set(),
  );
  const offered = (options?.options ?? []).map(({ flag }) => flag);
  const absent = [...selected].filter((flag) => !offered.includes(flag));
  return {
    selected,
    choose: (flag: string, chosen: boolean) => {
      if (options === undefined) return;
      setSelected((current) => withChoice(options, current, flag, chosen));
    },
    clearGroup: (group: Group) => {
      setSelected((current) => withoutGroup(current, group));
    },
    flags: offered.filter((flag) => selected.has(flag)),
    changedOfferLine:
      reading || absent.length === 0
        ? notOfferedLine
        : `Not offered any more, so not sent: ${absent.join(", ")}.`,
  };
}

export function LaunchOptions({
  id,
  label,
  shape,
  hint,
  selected,
  onChoose,
  onClearGroup,
}: {
  readonly id: string;
  // The disclosure's name.
  readonly label: string;
  readonly shape: OfferedShape;
  readonly hint?: string | undefined;
  readonly selected: ReadonlySet<string>;
  readonly onChoose: (flag: string, chosen: boolean) => void;
  readonly onClearGroup: (group: Group) => void;
}) {
  const row = (
    { flag, label, summary }: OfferedOption,
    input: (described: string) => ReactNode,
  ) => (
    <div key={flag} className="launch-option">
      {input(`${id}-summary${flag}`)}
      <label htmlFor={`${id}-option${flag}`}>{label}</label>
      <span id={`${id}-summary${flag}`} className="quiet">
        {summary}
      </span>
    </div>
  );
  const chosen = shape.options.filter(({ flag }) => selected.has(flag));
  return (
    <details className="launch-disclosure">
      <summary>
        {label}{" "}
        <span className="launch-disclosure-state">
          {chosen.length === 0
            ? "None selected"
            : `${chosen.map((option) => option.label).join(", ")} (${chosen.length})`}
        </span>
      </summary>
      <fieldset className="launch-options">
        <legend>Options</legend>
        {hint !== undefined && <p className="quiet">{hint}</p>}
        {layout(shape).map((item) =>
          "option" in item ? (
            row(item.option, (described) => (
              <input
                type="checkbox"
                id={`${id}-option${item.option.flag}`}
                aria-describedby={described}
                checked={selected.has(item.option.flag)}
                onChange={(event) => {
                  onChoose(item.option.flag, event.target.checked);
                }}
              />
            ))
          ) : (
            <fieldset
              key={item.group.id}
              className="launch-options launch-options-group"
            >
              <legend>{item.group.label}</legend>
              <div className="launch-option">
                <input
                  type="radio"
                  name={`${id}-group-${item.group.id}`}
                  id={`${id}-none-${item.group.id}`}
                  checked={!item.members.some(({ flag }) => selected.has(flag))}
                  onChange={() => {
                    onClearGroup(item.group);
                  }}
                />
                <label htmlFor={`${id}-none-${item.group.id}`}>
                  No {item.group.label}
                </label>
              </div>
              {item.members.map((member) =>
                row(member, (described) => (
                  <input
                    type="radio"
                    name={`${id}-group-${item.group.id}`}
                    id={`${id}-option${member.flag}`}
                    aria-describedby={described}
                    checked={selected.has(member.flag)}
                    onChange={() => {
                      onChoose(member.flag, true);
                    }}
                  />
                )),
              )}
            </fieldset>
          ),
        )}
      </fieldset>
    </details>
  );
}
