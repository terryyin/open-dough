// Shared whole-text highlighting lifecycle for source readers: answers
// `undefined` (plain text) at once and whenever `text` or `language` changes,
// then the token lines once Shiki has tokenized that whole text. A result for
// text or a language that is no longer current is dropped, and a failed
// grammar load leaves the reader plain.

import { useEffect, useState } from "react";
import {
  highlightSourceLines,
  type SourceTokenLine,
} from "./sourceHighlight.ts";

export function useSourceHighlight(
  text: string,
  language: string | undefined,
): readonly SourceTokenLine[] | undefined {
  const [tokenLines, setTokenLines] = useState<
    readonly SourceTokenLine[] | undefined
  >(undefined);

  useEffect(() => {
    setTokenLines(undefined);
    if (language === undefined) return;
    let cancelled = false;
    void highlightSourceLines(text, language).then((tokens) => {
      if (!cancelled && tokens !== undefined) setTokenLines(tokens);
    });
    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return tokenLines;
}
