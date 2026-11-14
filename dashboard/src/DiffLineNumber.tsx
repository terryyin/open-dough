// One printed line's old or new number in a story-review diff
// (`./StoryReviewDiffLines.tsx`): a control that opens that line's menu
// without joining the Tab order. The digit is stylesheet content so copying
// the line's code still leaves numbers out.

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { lineNumberLabel, type DiffLineSide } from "./diffLineSide.ts";
import "./diff-line-number.css";

export type { DiffLineSide };
export { lineNumberLabel };

export function DiffLineNumber({
  side,
  line,
  open,
  onOpen,
  onClose,
  onFollowUp,
}: {
  readonly side: DiffLineSide;
  readonly line: number;
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly onFollowUp: () => void;
}) {
  const label = lineNumberLabel(side, line);
  const menuId = useId();
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open) menu.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target)
      ) {
        // Keep the outside target from taking focus so the number regains it.
        event.preventDefault();
        onClose();
        button.current?.focus();
      }
    };
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("pointerdown", outside);
    };
  }, [open, onClose]);

  const dismissToNumber = () => {
    onClose();
    button.current?.focus();
  };

  return (
    <span
      ref={root}
      className="story-review-line-number-wrap"
      data-side={side}
      onBlur={(event) => {
        // Escape and outside pointerdown return focus to the number; blur
        // only closes so Follow up can move the keyboard into the dialog.
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        ref={button}
        type="button"
        className="story-review-line-number"
        tabIndex={-1}
        data-line={line}
        data-side={side}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) onClose();
          else onOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) onClose();
            else onOpen();
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            dismissToNumber();
          }
        }}
      />
      {open && (
        <div
          id={menuId}
          ref={menu}
          role="menu"
          aria-label={label}
          className="story-review-line-menu"
          onMouseDown={(event) => {
            // Safari clears button focus before click. Keep the menu mounted
            // through selection; keyboard focus departure still dismisses it.
            event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              dismissToNumber();
            }
          }}
        >
          <p className="story-review-line-menu-label">{label}</p>
          <button
            type="button"
            role="menuitem"
            className="frame-button"
            onClick={() => {
              onClose();
              onFollowUp();
            }}
          >
            Follow up
          </button>
        </div>
      )}
    </span>
  );
}
