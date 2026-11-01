// Optional phone text composer for longer drafts: an ordinary field plus
// Insert on the same attachment `insert` path as dictation. Insert never
// appends Enter; a deliberate toolbar or terminal Enter submits. When the
// attachment cannot accept input the draft stays for a deliberate retry and
// is never auto-replayed after reconnect. The draft row mounts only while
// Compose is expanded so collapsed chrome keeps the fitted terminal budget.

import { useState } from "react";

export function TerminalComposer({
  insert,
  open,
}: {
  // Offers draft text on the live attachment; false when none can accept it.
  readonly insert: (text: string) => boolean;
  readonly open: boolean;
}) {
  const [draft, setDraft] = useState("");
  if (!open) return null;
  return (
    <div className="terminal-composer">
      <input
        type="text"
        className="frame-input terminal-composer-draft"
        aria-label="Terminal draft"
        autoComplete="on"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
      <button
        type="button"
        className="terminal-composer-insert"
        aria-label="Insert draft"
        disabled={draft.length === 0}
        onClick={() => {
          if (insert(draft)) setDraft("");
        }}
      >
        Insert
      </button>
    </div>
  );
}
