import { useState } from "react";
import { withoutTerminalEscapeSequences } from "./terminalInputText.ts";

type Paste = (text: string) => boolean;

async function readClipboardText() {
  const items = await navigator.clipboard.read();
  const item = items.find(({ types }) => types.includes("text/plain"));
  if (!item) return "";
  const text = await (await item.getType("text/plain")).text();
  // Leave CR and LF for xterm's paste handling.
  return withoutTerminalEscapeSequences(text).replace(
    // eslint-disable-next-line no-control-regex
    /[\x00-\x09\x0b\x0c\x0e-\x1f\x7f-\x9f]/g,
    "",
  );
}

export function useTerminalPaste(getPaste: () => Paste | undefined) {
  const [feedback, setFeedback] = useState<string>();

  async function read() {
    const paste = getPaste();
    let text: string;
    try {
      text = await readClipboardText();
    } catch {
      setFeedback(
        "Could not read the clipboard. Open Compose and use your keyboard’s Paste.",
      );
      return;
    }
    if (!text) setFeedback("There was nothing to paste.");
    else if (!paste?.(text)) {
      setFeedback("Reconnect to the terminal, then tap Paste again.");
    } else setFeedback(undefined);
  }

  return { feedback, read };
}
