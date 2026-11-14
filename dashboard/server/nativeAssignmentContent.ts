// Host context is not an assignment. Classify each content part before joining,
// and retain genuine text following closed context blocks in the same part.
import { objectOf, stringOf } from "./nativeUsageFiles.ts";
export function nativeAssignmentContent(content: unknown) {
  const parts =
    typeof content === "string"
      ? [content]
      : Array.isArray(content)
        ? content.map((part) => stringOf(objectOf(part)["text"]) ?? "")
        : [];
  let injected = false;
  const text = parts
    .map((part) => {
      let remaining = part;
      for (;;) {
        const header = /^\s*# AGENTS\.md[^\n]*(?:\n|$)/i.exec(remaining);
        if (header) {
          injected = true;
          remaining = remaining.slice(header[0].length);
          if (!/^\s*<INSTRUCTIONS>/i.test(remaining)) return "";
        }
        const tag =
          /^\s*<(recommended_plugins|INSTRUCTIONS|environment_context|skill|system(?:-[a-z]+)?)(?:\s[^>]*)?>/i.exec(
            remaining,
          );
        if (!tag) break;
        injected = true;
        const end = new RegExp(`</${tag[1]}>`, "i").exec(remaining);
        if (!end) return "";
        remaining = remaining.slice(end.index + end[0].length);
      }
      return remaining;
    })
    .join("\n")
    .trim();
  return { text, injected };
}
