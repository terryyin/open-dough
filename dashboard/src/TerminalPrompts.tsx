// One terminal header slot offers fixed replies or dictation. Menu selection
// closes before acting; successful reply offers return focus through insert.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import "./terminal-prompts.css";

export function TerminalPrompts({
  insert,
  dictate,
  dictateDisabled,
}: {
  readonly insert: (text: string) => void;
  readonly dictate: () => void;
  readonly dictateDisabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
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
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };
  return (
    <div
      className="terminal-prompts"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <IconButton
        ref={button}
        label="Prompts"
        icon={MessageSquareText}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setOpen((shown) => !shown);
        }}
      />
      {open && (
        <div
          id={id}
          ref={menu}
          role="menu"
          aria-label="Prompts"
          className="terminal-prompts-menu"
          onMouseDown={(event) => {
            // Safari clears button focus before click. Keep the menu mounted
            // through selection; keyboard focus departure still dismisses it.
            event.preventDefault();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              button.current?.focus();
            } else if (
              ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
            ) {
              event.preventDefault();
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not(:disabled)",
                ),
              );
              const index = items.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : (index +
                        (event.key === "ArrowUp" ? -1 : 1) +
                        items.length) %
                      items.length;
              items[next]?.focus();
            }
          }}
        >
          {["OK", "as recommended"].map((text) => (
            <button
              key={text}
              type="button"
              role="menuitem"
              className="frame-button"
              onClick={() => {
                choose(() => {
                  insert(text);
                });
              }}
            >
              {text}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="frame-button"
            disabled={dictateDisabled}
            onClick={() => {
              choose(dictate);
            }}
          >
            Dictate into terminal
          </button>
        </div>
      )}
    </div>
  );
}
