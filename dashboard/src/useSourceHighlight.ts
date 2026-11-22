// Shared whole-text highlighting lifecycle for source readers: answers
// `undefined` (plain text) at once and whenever `text` or `language` changes,
// then the token lines once Shiki has tokenized that whole text. A result for
// text or a language that is no longer current is dropped, and a failed
// grammar load leaves the reader plain. The highlighter is the page's
// (`./pageReads.tsx`).

import { useEffect, useState } from "react";
import { useSourceHighlighter } from "./pageReads.tsx";
import type { SourceTokenLine } from "./sourceHighlight.ts";

export function useSourceHighlight(
  text: string,
  language: string | undefined,
): readonly SourceTokenLine[] | undefined {
  const [tokenLines, setTokenLines] = useState<
    readonly SourceTokenLine[] | undefined
  >(undefined);
  const highlight = useSourceHighlighter();

  useEffect(() => {
    setTokenLines(undefined);
    if (language === undefined) return;
    let cancelled = false;
    void highlight(text, language).then((tokens) => {
      if (!cancelled && tokens !== undefined) setTokenLines(tokens);
    });
    return () => {
      cancelled = true;
    };
  }, [highlight, text, language]);

  return tokenLines;
}
