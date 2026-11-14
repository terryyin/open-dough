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
      let genuine = "";
      for (;;) {
        const header = /^\s*# AGENTS\.md[^\n]*(?:\n|$)/i.exec(remaining);
        if (header) {
          injected = true;
          remaining = remaining.slice(header[0].length);
          if (!/^\s*<INSTRUCTIONS>/i.test(remaining)) return genuine;
        }
        const tag =
          /<(recommended_plugins|INSTRUCTIONS|environment_context|skill|system(?:-[a-z]+)?)(?:\s[^>]*)?>/i.exec(
            remaining,
          );
        if (!tag) break;
        injected = true;
        genuine += `${remaining.slice(0, tag.index)}\n`;
        const tail = remaining.slice(tag.index + tag[0].length);
        const end = new RegExp(`</${tag[1]}>`, "i").exec(tail);
        if (!end) return genuine;
        remaining = tail.slice(end.index + end[0].length);
      }
      return genuine + remaining;
    })
    .join("\n")
    .trim();
  return { text, injected };
}
