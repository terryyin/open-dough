// On-demand source highlighting for the shared source-lines view
// (`./SourceLines.tsx`): Shiki's core and JavaScript engine, with each
// Intent syntax hint's grammar and github-light/github-dark loaded only when
// first needed. `sourceLanguage` maps an Intent syntax hint (+ path for
// typescript/.tsx) to the Shiki language id. Failure leaves the caller with
// plain text and no error surface. Both theme colours ship on each token so
// CSS can follow the system appearance without re-tokenization.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type SourceTokenColors = {
  readonly content: string;
  readonly light?: string;
  readonly dark?: string;
};

export type SourceTokenLine = readonly SourceTokenColors[];

const languageLoaders = {
  gherkin: () => import("@shikijs/langs/gherkin"),
  typescript: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  javascript: () => import("@shikijs/langs/javascript"),
  python: () => import("@shikijs/langs/python"),
  shellscript: () => import("@shikijs/langs/shellscript"),
} as const;

type GrammarModule = keyof typeof languageLoaders;

let highlighter: Promise<HighlighterCore> | undefined;
const languageLoads = new Map<GrammarModule, Promise<void>>();

function loadHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [
      () => import("@shikijs/themes/github-light"),
      () => import("@shikijs/themes/github-dark"),
    ],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  }).catch((error: unknown) => {
    highlighter = undefined;
    throw error;
  });
  return highlighter;
}

// Intent syntax hint (+ path for typescript/.tsx) → Shiki language id.
// `shell` is an alias registered by the shellscript grammar.
export function sourceLanguage(hint: string, path: string): string | undefined {
  switch (hint) {
    case "gherkin":
    case "javascript":
    case "python":
    case "shell":
      return hint;
    case "typescript":
      return path.endsWith(".tsx") ? "tsx" : "typescript";
    default:
      return undefined;
  }
}

function grammarModuleFor(shikiLang: string): GrammarModule | undefined {
  if (shikiLang === "shell") return "shellscript";
  return shikiLang in languageLoaders
    ? (shikiLang as GrammarModule)
    : undefined;
}

async function ensureLanguage(
  core: HighlighterCore,
  shikiLang: string,
): Promise<void> {
  if (core.getLoadedLanguages().includes(shikiLang)) return;
  const moduleId = grammarModuleFor(shikiLang);
  if (moduleId === undefined) return;
  let pending = languageLoads.get(moduleId);
  if (pending === undefined) {
    pending = core
      .loadLanguage(languageLoaders[moduleId])
      .then(() => undefined)
      .catch((error: unknown) => {
        languageLoads.delete(moduleId);
        throw error;
      });
    languageLoads.set(moduleId, pending);
  }
  await pending;
}

// Token lines for `text` in a Shiki language id from `sourceLanguage`, or
// `undefined` when the language is unsupported or loading/tokenization fails.
export async function highlightSourceLines(
  text: string,
  language: string,
): Promise<readonly SourceTokenLine[] | undefined> {
  if (grammarModuleFor(language) === undefined) return undefined;
  try {
    const core = await loadHighlighter();
    await ensureLanguage(core, language);
    const lines = core.codeToTokensWithThemes(text, {
      lang: language,
      themes: { light: "github-light", dark: "github-dark" },
    });
    return lines.map((line) =>
      line.map((token) => {
        const light = token.variants.light?.color;
        const dark = token.variants.dark?.color;
        return {
          content: token.content,
          ...(light === undefined ? {} : { light }),
          ...(dark === undefined ? {} : { dark }),
        };
      }),
    );
  } catch {
    return undefined;
  }
}
