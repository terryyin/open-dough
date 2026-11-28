import type { ComponentType } from "react";
import type { DashboardPerspective } from "./dashboardRouteUrl.ts";
import { FrameTooltip } from "./Icon.tsx";
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

// Which perspective the page shows of the selected project. The active
// Intent choice also names the perspective when the banner has room.
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
            aria-label={option.label}
            checked={perspective === option.id}
            onChange={() => {
              onSelect(option.id);
            }}
          />
          <span>
            <option.Mark />
            {perspective === "intent" && option.id === "intent" && (
              <span className="perspective-name" aria-hidden="true">
                {option.label}
              </span>
            )}
          </span>
          <FrameTooltip>{option.label}</FrameTooltip>
        </label>
      ))}
    </div>
  );
}
