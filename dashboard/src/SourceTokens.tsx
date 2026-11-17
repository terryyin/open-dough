// One shared token renderer for every source reader (Intent's `SourceLines`
// and, later, file diffs): each token is a `<span>` carrying its light and
// dark colours as CSS custom properties, so `source-tokens.css` selects the
// colour from the system appearance without re-tokenization. Callers own the
// surrounding line element and render plain text while tokens are absent.

import type { CSSProperties } from "react";
import type { SourceTokenLine } from "./sourceHighlight.ts";
import "./source-tokens.css";

// Shared by Intent's SourceTokens and story-review lines that split tokens at
// emphasis ranges without changing this component's own output.
export function tokenStyle(
  token: SourceTokenLine[number],
): CSSProperties | undefined {
  if (token.light === undefined && token.dark === undefined) return undefined;
  return {
    ...(token.light === undefined ? {} : { ["--shiki-light"]: token.light }),
    ...(token.dark === undefined ? {} : { ["--shiki-dark"]: token.dark }),
  } as CSSProperties;
}

export function SourceTokens({ tokens }: { readonly tokens: SourceTokenLine }) {
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className="source-token" style={tokenStyle(token)}>
          {token.content}
        </span>
      ))}
    </>
  );
}
