// On-demand syntax styling for every source reader -- Intent's source reading
// (`./SourceLines.tsx`) and story-review file diffs (`./diffLineTokens.ts`) --
// through `./useSourceHighlight.ts`: Shiki's core and JavaScript engine, with
// each of the eleven path grammars (TypeScript, TSX, JavaScript, Java, Python,
// shell, Gherkin, Markdown, JSON, CSS, YAML) and the
// github-light-high-contrast and github-dark-high-contrast palettes loaded only
// when first needed. `sourceLanguage` maps an Intent syntax hint (+ path for
// typescript/.tsx) and `pathLanguage` a diffed file's path to the Shiki
// language id. Failure leaves the caller with plain text and no error surface.
// Both theme colours ship on each token so CSS can follow the system
// appearance without re-tokenization.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type SourceTokenColors = {
  readonly content: string;
  readonly light?: string;
  readonly dark?: string;
};

export type SourceTokenLine = readonly SourceTokenColors[];

// The page's source highlighter: token lines for a text in a Shiki language
// id, or `undefined` (plain text) when it cannot highlight; it never rejects.
export type SourceHighlighter = (
  text: string,
  language: string,
) => Promise<readonly SourceTokenLine[] | undefined>;

const languageLoaders = {
  gherkin: () => import("@shikijs/langs/gherkin"),
  typescript: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  javascript: () => import("@shikijs/langs/javascript"),
  java: () => import("@shikijs/langs/java"),
  python: () => import("@shikijs/langs/python"),
  shellscript: () => import("@shikijs/langs/shellscript"),
  markdown: () => import("@shikijs/langs/markdown"),
  json: () => import("@shikijs/langs/json"),
  css: () => import("@shikijs/langs/css"),
  yaml: () => import("@shikijs/langs/yaml"),
} as const;

type GrammarModule = keyof typeof languageLoaders;

let highlighter: Promise<HighlighterCore> | undefined;
const languageLoads = new Map<GrammarModule, Promise<void>>();

function loadHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [
      () => import("@shikijs/themes/github-light-high-contrast"),
      () => import("@shikijs/themes/github-dark-high-contrast"),
    ],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  }).catch((error: unknown) => {
    highlighter = undefined;
    throw error;
  });
  return highlighter;
}

// A file path's extension → Shiki language id, over the same grammars;
// any other file reads as plain text.
const extensionLanguages: Readonly<Record<string, string>> = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  java: "java",
  py: "python",
  sh: "shell",
  bash: "shell",
  feature: "gherkin",
  md: "markdown",
  json: "json",
  css: "css",
  yaml: "yaml",
  yml: "yaml",
};

export function pathLanguage(path: string): string | undefined {
  const extension = /\.([^./]+)$/.exec(path)?.[1];
  return extension === undefined ? undefined : extensionLanguages[extension];
}

// Intent syntax hint (+ path for typescript/.tsx) → Shiki language id.
// `shell` is an alias registered by the shellscript grammar.
export function sourceLanguage(hint: string, path: string): string | undefined {
  switch (hint) {
    case "gherkin":
    case "javascript":
    case "java":
    case "python":
    case "shell":
    case "markdown":
    case "json":
    case "css":
    case "yaml":
      return hint;
    case "typescript":
      return pathLanguage(path) === "tsx" ? "tsx" : "typescript";
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

// Token lines for `text` in a Shiki language id from `sourceLanguage` or
// `pathLanguage`, or `undefined` when the language is unsupported or
// loading/tokenization fails.
export const highlightSourceLines: SourceHighlighter = async (
  text,
  language,
) => {
  if (grammarModuleFor(language) === undefined) return undefined;
  try {
    const core = await loadHighlighter();
    await ensureLanguage(core, language);
    const lines = core.codeToTokensWithThemes(text, {
      lang: language,
      themes: {
        light: "github-light-high-contrast",
        dark: "github-dark-high-contrast",
      },
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
};
