// The options a launch dialog offers: a checkbox per entry outside any group
// and, per exclusive group, a fieldset of radios with a "No <group>" choice,
// each entry with its label, flag and summary. The dialog owns which are
// selected; a group's rule is the shared model's (`withChoice`).

import type { ReactNode } from "react";
import type { OfferedOption, OfferedShape } from "./commandOptions.ts";

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

export function LaunchOptions({
  id,
  shape,
  hint,
  selected,
  onChoose,
  onClearGroup,
}: {
  readonly id: string;
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
      <code>{flag}</code>
      <span id={`${id}-summary${flag}`} className="quiet">
        {summary}
      </span>
    </div>
  );
  return (
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
  );
}
