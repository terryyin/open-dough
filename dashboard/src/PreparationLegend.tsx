import { useRef } from "react";
import { BadgeLegend } from "./PreparationCard";
import "./preparation-legend.css";

// The browser's modal top layer makes the rest of the dashboard inert,
// including the pinned banner. This help has no observation state or reads.
export function PreparationLegend() {
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const readingPosition = useRef({ x: 0, y: 0 });

  return (
    <div className="preparation-help">
      <button
        ref={launcher}
        type="button"
        className="preparation-help-button"
        aria-label="Preparation badge legend"
        aria-haspopup="dialog"
        onClick={() => {
          readingPosition.current = { x: window.scrollX, y: window.scrollY };
          dialog.current?.showModal();
          close.current?.focus({ preventScroll: true });
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      <dialog
        ref={dialog}
        className="preparation-legend-dialog"
        aria-labelledby="badge-legend-heading"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          if (event.shiftKey && event.target === close.current) {
            event.preventDefault();
            content.current?.focus({ preventScroll: true });
          } else if (!event.shiftKey && event.target === content.current) {
            event.preventDefault();
            close.current?.focus({ preventScroll: true });
          }
        }}
        onClose={() => {
          launcher.current?.focus({ preventScroll: true });
          window.scrollTo(readingPosition.current.x, readingPosition.current.y);
        }}
      >
        <div className="preparation-legend-actions">
          <button
            ref={close}
            type="button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <div
          ref={content}
          className="preparation-legend-content"
          role="region"
          aria-label="Badge explanations"
          tabIndex={0}
        >
          <BadgeLegend />
        </div>
      </dialog>
    </div>
  );
}
