// Touch accessory keys for the Side panel terminal: inject the sequences a
// phone soft keyboard does not supply, on the same attachment input path as
// typing, without dismissing that soft keyboard (Blink-style pointerdown
// preventDefault so xterm's textarea keeps focus). Owns the optional Compose
// reveal and an explicit Hide keyboard control so phone chrome stays one
// accessory mount beside the screen. Select, beside Paste, pauses the output
// as selectable text (./TerminalPausedText.tsx) and reads as on while it does.

import { useState, type PointerEvent } from "react";
import { TerminalComposer } from "./TerminalComposer.tsx";

const primaryKeys = [
  { name: "Esc", sequence: "\u001b", label: "Esc" },
  { name: "Tab", sequence: "\t", label: "Tab" },
  { name: "Up", sequence: "\u001b[A", label: "↑" },
  { name: "Down", sequence: "\u001b[B", label: "↓" },
  { name: "Left", sequence: "\u001b[D", label: "←" },
  { name: "Right", sequence: "\u001b[C", label: "→" },
] as const;

const trailingKeys = [{ name: "Enter", sequence: "\r", label: "↵" }] as const;

const moreKeys = [
  { name: "Ctrl+C", sequence: "\u0003", label: "Ctrl+C" },
] as const;

function keepTerminalFocus(event: PointerEvent<HTMLElement>): void {
  event.preventDefault();
}

function ToolbarKey({
  name,
  label,
  sequence,
  insert,
}: {
  readonly name: string;
  readonly label: string;
  readonly sequence: string;
  readonly insert: (sequence: string) => boolean;
}) {
  return (
    <button
      type="button"
      className="terminal-key-toolbar-key"
      aria-label={name}
      onPointerDown={keepTerminalFocus}
      onClick={() => {
        insert(sequence);
      }}
    >
      {label}
    </button>
  );
}

function ToolbarToggle({
  name,
  label,
  expanded,
  onToggle,
}: {
  readonly name: string;
  readonly label: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="terminal-key-toolbar-key"
      aria-label={name}
      aria-expanded={expanded}
      onPointerDown={keepTerminalFocus}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

// Blurs the focused field so the soft keyboard can dismiss; unlike sequence
// keys, it must not preventDefault on pointerdown or focus would stay put.
function HideKeyboardKey() {
  return (
    <button
      type="button"
      className="terminal-key-toolbar-key"
      aria-label="Hide keyboard"
      onClick={() => {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      }}
    >
      Hide
    </button>
  );
}

export function TerminalKeyToolbar({
  insert,
  onPaste,
  selecting,
  onSelect,
}: {
  // Offers one sequence on the live attachment; false when none is attached.
  readonly insert: (sequence: string) => boolean;
  readonly onPaste: () => void;
  // Whether the output is paused as selectable text, and how to change that.
  readonly selecting: boolean;
  readonly onSelect: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  return (
    <>
      <div
        className="terminal-key-toolbar"
        role="toolbar"
        aria-label="Terminal keys"
      >
        <span className="terminal-key-toolbar-primary">
          {primaryKeys.map((key) => (
            <ToolbarKey key={key.name} {...key} insert={insert} />
          ))}
        </span>
        <span className="terminal-key-toolbar-trailing">
          {trailingKeys.map((key) => (
            <ToolbarKey key={key.name} {...key} insert={insert} />
          ))}
          <button
            type="button"
            className="terminal-key-toolbar-key"
            onPointerDown={keepTerminalFocus}
            onClick={onPaste}
          >
            Paste
          </button>
          <button
            type="button"
            className="terminal-key-toolbar-key"
            aria-pressed={selecting}
            onPointerDown={keepTerminalFocus}
            onClick={onSelect}
          >
            Select
          </button>
          <ToolbarToggle
            name="More terminal keys"
            label="More"
            expanded={moreOpen}
            onToggle={() => {
              setMoreOpen((open) => !open);
            }}
          />
          {moreOpen && (
            <>
              <HideKeyboardKey />
              <ToolbarToggle
                name="Compose"
                label="Compose"
                expanded={composeOpen}
                onToggle={() => {
                  setComposeOpen((open) => !open);
                }}
              />
              {moreKeys.map((key) => (
                <ToolbarKey key={key.name} {...key} insert={insert} />
              ))}
            </>
          )}
        </span>
      </div>
      <TerminalComposer insert={insert} open={composeOpen} />
    </>
  );
}
