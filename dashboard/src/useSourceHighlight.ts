// Shared whole-text highlighting lifecycle for source readers: answers
// `undefined` (plain text) at once and whenever `text` or `language` changes,
// then the token lines once Shiki has tokenized that whole text. A result for
// text or a language that is no longer current is dropped, and a failed
// grammar load leaves the reader plain. System settings Off
// (`./savedSyntaxStyling.ts`) skips tokenization for Intent and diffs alike;
// missing or Default keeps today's highlight.

import { useEffect, useState } from "react";
import { useSavedSyntaxStyling } from "./savedSyntaxStyling.ts";
import {
  highlightSourceLines,
  type SourceTokenLine,
} from "./sourceHighlight.ts";

export function useSourceHighlight(
  text: string,
  language: string | undefined,
): readonly SourceTokenLine[] | undefined {
  const { saved } = useSavedSyntaxStyling();
  const stylingOff = saved === "off";
  const [tokenLines, setTokenLines] = useState<
    readonly SourceTokenLine[] | undefined
  >(undefined);

  useEffect(() => {
    setTokenLines(undefined);
    if (language === undefined || stylingOff) return;
    let cancelled = false;
    void highlightSourceLines(text, language).then((tokens) => {
      if (!cancelled && tokens !== undefined) setTokenLines(tokens);
    });
    return () => {
      cancelled = true;
    };
  }, [text, language, stylingOff]);

  return tokenLines;
}
