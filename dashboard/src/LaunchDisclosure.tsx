// A launch dialog's disclosure (./launch-dialog.css): a frame disclosure that
// starts closed, its summary led by the frame's turning chevron.

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./frame-controls.css";

export function LaunchDisclosure({
  summary,
  children,
}: {
  // What the disclosure holds and, for options, what is selected.
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <details className="launch-disclosure frame-disclosure">
      <summary>
        <Icon icon={ChevronRight} />
        {summary}
      </summary>
      {children}
    </details>
  );
}
