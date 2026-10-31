// On-demand Gherkin highlighting for the shared source-lines view
// (`./SourceLines.tsx`): Shiki's core and JavaScript engine, with the
// Gherkin grammar and github-light theme loaded only when first needed.
// Failure leaves the caller with plain text and no error surface.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { ThemedToken } from "shiki/core";

export type SourceTokenLine = readonly ThemedToken[];

let highlighter: Promise<HighlighterCore> | undefined;

function loadGherkinHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [() => import("@shikijs/themes/github-light")],
    langs: [() => import("@shikijs/langs/gherkin")],
    engine: createJavaScriptRegexEngine(),
  }).catch((error: unknown) => {
    highlighter = undefined;
    throw error;
  });
  return highlighter;
}

// Token lines for `text` in the given Intent source kind's grammar, or
// `undefined` when the kind is unsupported or loading/tokenization fails.
export async function highlightSourceLines(
  text: string,
  language: string,
): Promise<readonly SourceTokenLine[] | undefined> {
  if (language !== "gherkin") return undefined;
  try {
    const core = await loadGherkinHighlighter();
    return core.codeToTokens(text, {
      lang: "gherkin",
      theme: "github-light",
    }).tokens;
  } catch {
    return undefined;
  }
}
