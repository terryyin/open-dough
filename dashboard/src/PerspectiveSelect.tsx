import { useLayoutEffect, useRef, type ComponentType } from "react";
import type { DashboardPerspective } from "./dashboardRouteUrl.ts";
import { DevelopmentMark, IntentMark } from "./PerspectiveMarks.tsx";
import "./project-select.css";

const perspectiveRadioName = "perspective";

const perspectives: readonly {
  readonly id: DashboardPerspective;
  readonly label: string;
  readonly Mark: ComponentType;
}[] = [
  { id: "development", label: "Development", Mark: DevelopmentMark },
  { id: "intent", label: "Intent", Mark: IntentMark },
];

// Which perspective the page shows of the selected project. Native radios
// keep their own arrow keys, so page-wide project cycling leaves them alone
// (./projectKeyboardNavigation.ts) and choosing a perspective never selects
// another project. Each choice shows its meaning mark beside its label;
// Structure is not offered.
export function PerspectiveSelect({
  perspective,
  onSelect,
}: {
  readonly perspective: DashboardPerspective;
  readonly onSelect: (next: DashboardPerspective) => void;
}) {
  return (
    <div
      className="perspective-select"
      role="radiogroup"
      aria-label="Perspective"
    >
      {perspectives.map((option) => (
        <label key={option.id} className="perspective-choice">
          <input
            type="radio"
            name={perspectiveRadioName}
            value={option.id}
            checked={perspective === option.id}
            onChange={() => {
              onSelect(option.id);
            }}
          />
          <span>
            <option.Mark />
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// A perspective change hides the other perspective's content; the keyboard
// never stays in content it hid, and goes to the selected perspective's
// choice instead. Focus anywhere still shown, as the banner or the Side
// panel, stays where it is.
export function usePerspectiveFocus(perspective: DashboardPerspective): void {
  const previous = useRef(perspective);
  useLayoutEffect(() => {
    if (previous.current === perspective) return;
    previous.current = perspective;
    const focused = document.activeElement;
    if (
      focused instanceof HTMLElement &&
      focused.closest(".page-column") !== null &&
      focused.getClientRects().length === 0
    ) {
      document
        .querySelector<HTMLInputElement>(
          `input[type="radio"][name="${perspectiveRadioName}"]:checked`,
        )
        ?.focus();
    }
  }, [perspective]);
}
