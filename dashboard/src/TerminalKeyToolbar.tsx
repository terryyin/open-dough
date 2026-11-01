// Touch accessory keys for the Side panel terminal: inject the sequences a
// phone soft keyboard does not supply, on the same attachment input path as
// typing, without dismissing that soft keyboard (Blink-style pointerdown
// preventDefault so xterm's textarea keeps focus).

import { useState, type PointerEvent } from "react";

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

export function TerminalKeyToolbar({
  insert,
}: {
  // Offers one sequence on the live attachment; false when none is attached.
  readonly insert: (sequence: string) => boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div
      className="terminal-key-toolbar"
      role="toolbar"
      aria-label="Terminal keys"
    >
      {primaryKeys.map((key) => (
        <ToolbarKey key={key.name} {...key} insert={insert} />
      ))}
      <span className="terminal-key-toolbar-trailing">
        {trailingKeys.map((key) => (
          <ToolbarKey key={key.name} {...key} insert={insert} />
        ))}
        <button
          type="button"
          className="terminal-key-toolbar-key"
          aria-label="More terminal keys"
          aria-expanded={moreOpen}
          onPointerDown={keepTerminalFocus}
          onClick={() => {
            setMoreOpen((open) => !open);
          }}
        >
          More
        </button>
        {moreOpen &&
          moreKeys.map((key) => (
            <ToolbarKey key={key.name} {...key} insert={insert} />
          ))}
      </span>
    </div>
  );
}
