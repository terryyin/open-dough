// One Intent tablist: a segmented group of tabs drawn like the banner's
// Perspective choice (`./project-select.css`), each tab controlling the
// tabpanel its caller renders under `intentTabPanelId`. The selected tab is
// the only one in the tab order; Arrow keys, Home and End move between the
// tabs, choose the one reached and focus it, and the handled keys never reach
// page-wide project cycling (`./projectKeyboardNavigation.ts`).

import type { KeyboardEvent } from "react";
import "./project-select.css";

export interface IntentTabOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export function intentTabId(idPrefix: string, value: string) {
  return `${idPrefix}-${value}-tab`;
}

export function intentTabPanelId(idPrefix: string, value: string) {
  return `${idPrefix}-${value}-panel`;
}

export function IntentTabs<T extends string>({
  options,
  selected,
  onSelect,
  label,
  idPrefix,
}: {
  readonly options: readonly IntentTabOption<T>[];
  readonly selected: T;
  readonly onSelect: (next: T) => void;
  readonly label: string;
  readonly idPrefix: string;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const at = options.findIndex((option) => option.value === selected);
    const next =
      event.key === "ArrowRight"
        ? (at + 1) % options.length
        : event.key === "ArrowLeft"
          ? (at - 1 + options.length) % options.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    const chosen = options[next];
    if (chosen === undefined) return;
    onSelect(chosen.value);
    document.getElementById(intentTabId(idPrefix, chosen.value))?.focus();
  }

  return (
    <div
      className="intent-tabs"
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            id={intentTabId(idPrefix, option.value)}
            className="intent-tab"
            aria-selected={isSelected}
            aria-controls={intentTabPanelId(idPrefix, option.value)}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              onSelect(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
