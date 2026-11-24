import { useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import { useSessionServices } from "./pageReads.tsx";
import {
  isImageAttachmentType,
  type ImageAttachmentType,
} from "./launchAttachments.ts";
import { withoutTerminalEscapeSequences } from "./terminalInputText.ts";

type PasteOffer = {
  readonly acceptsInput: () => boolean;
  readonly offer: (text: string) => boolean;
};

// Names the panel's shown attach-again action, or says the attachment is
// still connecting when there is none.
const unavailable = (action: string | undefined) =>
  action === undefined
    ? "The terminal is still connecting. Tap Paste again once it connects."
    : `Tap ${action}, then tap Paste again.`;

type ClipboardContent =
  | { readonly text: string }
  | { readonly image: Blob; readonly type: ImageAttachmentType };

async function readClipboard(): Promise<ClipboardContent> {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    const type = item.types.find(isImageAttachmentType);
    if (type !== undefined) {
      return { image: await item.getType(type), type };
    }
  }
  const item = items.find(({ types }) => types.includes("text/plain"));
  const text = item ? await (await item.getType("text/plain")).text() : "";
  // Leave CR and LF for xterm's paste handling.
  return {
    text: withoutTerminalEscapeSequences(text).replace(
      // eslint-disable-next-line no-control-regex
      /[\x00-\x09\x0b\x0c\x0e-\x1f\x7f-\x9f]/g,
      "",
    ),
  };
}

export function useTerminalPaste(
  record: LaunchRecord,
  getPaste: () => PasteOffer | undefined,
  recovery: () => string | undefined,
) {
  const { storeTerminalImage } = useSessionServices();
  const [feedback, setFeedback] = useState<string>();

  async function read() {
    const paste = getPaste();
    let content: ClipboardContent;
    try {
      content = await readClipboard();
    } catch {
      setFeedback(
        "Could not read the clipboard. Open Compose and use your keyboard’s Paste.",
      );
      return;
    }
    if ("image" in content) {
      if (!paste?.acceptsInput()) {
        setFeedback(unavailable(recovery()));
        return;
      }
      const stored = await storeTerminalImage(
        record,
        content.image,
        content.type,
      );
      if ("error" in stored) setFeedback(stored.error);
      else if (!paste.offer(stored.path)) setFeedback(unavailable(recovery()));
      else setFeedback(`Image pasted as ${stored.path}.`);
    } else if (!content.text) setFeedback("There was nothing to paste.");
    else if (!paste?.offer(content.text)) setFeedback(unavailable(recovery()));
    else setFeedback(undefined);
  }

  return { feedback, read };
}
