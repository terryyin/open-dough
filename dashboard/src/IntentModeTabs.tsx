// The Intent perspective's two reading modes (`./IntentBrowser.tsx`):
// Intent, its locations with Purpose and Proof, and Optimization Candidates,
// the published record across the content area. One segmented strip under
// the banner, drawn like the banner's Perspective choice
// (`./project-select.css`) but a tablist of Intent's own, not another
// perspective. Arrow keys, Home and End move between the tabs and choose the
// one reached; the handled keys never reach page-wide project cycling
// (`./projectKeyboardNavigation.ts`).

import type { KeyboardEvent } from "react";
import "./project-select.css";

export type IntentMode = "intent" | "candidates";

const modes: readonly { readonly id: IntentMode; readonly label: string }[] = [
  { id: "intent", label: "Intent" },
  { id: "candidates", label: "Optimization Candidates" },
];

export function intentModeTabId(idPrefix: string, mode: IntentMode) {
  return `${idPrefix}-${mode}-tab`;
}

export function intentModePanelId(idPrefix: string, mode: IntentMode) {
  return `${idPrefix}-${mode}-panel`;
}

export function IntentModeTabs({
  mode,
  idPrefix,
  onSelect,
}: {
  readonly mode: IntentMode;
  readonly idPrefix: string;
  readonly onSelect: (next: IntentMode) => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const at = modes.findIndex((option) => option.id === mode);
    const next =
      event.key === "ArrowRight"
        ? (at + 1) % modes.length
        : event.key === "ArrowLeft"
          ? (at - 1 + modes.length) % modes.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? modes.length - 1
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    const chosen = modes[next];
    if (chosen === undefined) return;
    onSelect(chosen.id);
    document.getElementById(intentModeTabId(idPrefix, chosen.id))?.focus();
  }

  return (
    <div className="intent-mode-bar">
      <div
        className="intent-mode-tabs"
        role="tablist"
        aria-label="Intent reading"
        onKeyDown={onKeyDown}
      >
        {modes.map((option) => {
          const selected = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={intentModeTabId(idPrefix, option.id)}
              className="intent-mode-tab"
              aria-selected={selected}
              aria-controls={intentModePanelId(idPrefix, option.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                onSelect(option.id);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
