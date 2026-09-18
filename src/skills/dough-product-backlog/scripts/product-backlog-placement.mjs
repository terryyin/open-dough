// Where an entry line sits inside one of the backlog's two lists, and how a
// line is written there without disturbing the text around it. Adding an entry
// and moving one between lists ask the same questions, so they ask them here.

export function entriesIn(document, name) {
  return document.entries.filter((entry) => entry.list === name);
}

// The line a new entry takes at the end of a section, including a section that
// holds no entries yet.
export function appendIndex(document, section) {
  const entries = entriesIn(document, section.name);
  if (entries.length > 0) {
    return entries[entries.length - 1].index + 1;
  }
  let index = section.start;
  if (document.lines[index] === "") {
    index += 1;
  }
  return index;
}

// Writes the line at `index`, keeping the blank line that separates the last
// entry of a section from whatever follows it.
export function insertEntryLine(document, index, line) {
  document.lines.splice(index, 0, line);
  const following = document.lines[index + 1];
  if (
    following !== undefined &&
    following !== "" &&
    !following.startsWith("- ")
  ) {
    document.lines.splice(index + 1, 0, "");
  }
}

// Rewrites the entry at `from` as `line` at `to`, an index read while the
// entry was still in place; removing it first shifts everything after it.
export function moveEntryLine(document, from, to, line) {
  document.lines.splice(from, 1);
  insertEntryLine(document, to > from ? to - 1 : to, line);
}
