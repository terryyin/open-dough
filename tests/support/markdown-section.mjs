// Guidance tests read one second-level section of a Markdown reference.
import assert from "node:assert/strict";

// The body of `heading`'s section: the lines after that exact heading line, up
// to the next `## ` heading.
export function markdownSection(text, heading) {
  const lines = text.split("\n");
  const start = lines.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading}`);
  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith("## "),
  );
  return lines.slice(start + 1, next === -1 ? undefined : next).join("\n");
}
