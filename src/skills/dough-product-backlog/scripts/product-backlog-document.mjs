// Parses and rewrites the established product backlog Markdown shape: an
// optional "## Near-future direction" section, then "## Taken", then
// "## Backlog list". Everything outside a changed entry line is preserved byte
// for byte. This is the document model, not a general Markdown editing
// framework; the operations that change a backlog live beside it.

import { joinSource, splitSource } from "./product-backlog-source.mjs";

export const takenHeading = "Taken";
export const queueHeading = "Backlog list";

const separator = " — ";
const entryPattern = /^- \[(?<title>[^[\]]+)\]\((?<href>[^)\s]+)\)(?<rest>.*)$/;
// The identity token and the active-plan link are each optional, so an entry
// written before its identity was adopted still reads as the same work item.
const detailPattern =
  /^(?: — (?<token>[^\s()[\]]+))?(?: \(\[(?<label>[^[\]]+)\]\((?<target>[^)\s]+)\)\))?$/;

export class BacklogError extends Error {
  constructor(message) {
    super(message);
    this.name = "BacklogError";
  }

  // Every refusal carries the same promise: the file was left as it was.
  get refusal() {
    return `${this.message}\nThe backlog was not changed.`;
  }
}

const adoptionHint =
  "Identities are never allocated here; take one from the work item's " +
  "canonical home or from the separate identity-adoption operation.";

export function ambiguousHome(reason) {
  return new BacklogError(
    `Ambiguous canonical home: ${reason} ${adoptionHint}`,
  );
}

// A backlog link names a canonical home and, when that home holds more than
// one story, the anchor of the story inside it. Everything that reads or
// records an identity takes a link apart here.
export function splitHref(href) {
  const marker = href.indexOf("#");
  return marker === -1
    ? { path: href, anchor: "" }
    : { path: href.slice(0, marker), anchor: href.slice(marker + 1) };
}

// How an identity is spelled: the ID the canonical home carries, narrowed by
// the story anchor when there is one. Deriving and adopting an identity both
// compose it here, so the spelling has one owner.
export function composeIdentity(token, anchor) {
  return anchor ? `${token}#${anchor}` : token;
}

function identityFor(href, token) {
  if (!token) {
    return href;
  }
  return composeIdentity(token, splitHref(href).anchor);
}

function readEntry(line, index, list) {
  const match = entryPattern.exec(line);
  if (!match) {
    throw new BacklogError(
      `Unsupported entry in "## ${list}" at line ${index + 1}: ${line}`,
    );
  }
  const { title, href, rest } = match.groups;
  let token = "";
  let plan;
  if (rest !== "") {
    const detail = detailPattern.exec(rest);
    if (!detail) {
      throw new BacklogError(
        `Unsupported entry detail in "## ${list}" at line ${index + 1}: ${line}`,
      );
    }
    token = detail.groups.token ?? "";
    if (detail.groups.target !== undefined) {
      plan = { label: detail.groups.label, target: detail.groups.target };
    }
  }
  return { identity: identityFor(href, token), title, href, plan, list, index };
}

// Reads one established entry bullet, for callers that hold a written line
// rather than its separate fields.
export function parseEntryLine(line) {
  return readEntry(line, 0, queueHeading);
}

function sectionFor(lines, headings, name) {
  const matches = headings.filter((heading) => heading.title === name);
  if (matches.length !== 1) {
    throw new BacklogError(
      `Expected exactly one "## ${name}" section; found ${matches.length}.`,
    );
  }
  const following = headings[headings.indexOf(matches[0]) + 1];
  return {
    name,
    start: matches[0].index + 1,
    end: following ? following.index : lines.length,
  };
}

function readSection(lines, section) {
  const entries = [];
  for (let index = section.start; index < section.end; index += 1) {
    const line = lines[index];
    if (line.trim() === "") {
      continue;
    }
    if (!line.startsWith("- ")) {
      throw new BacklogError(
        `Unsupported text in "## ${section.name}" at line ${index + 1}: ${line}`,
      );
    }
    entries.push(readEntry(line, index, section.name));
  }
  return entries;
}

function requireDistinctWork(entries) {
  for (const entry of entries) {
    const clash = entries.find(
      (other) =>
        other !== entry &&
        other.index < entry.index &&
        (other.identity === entry.identity || other.href === entry.href),
    );
    if (clash) {
      throw new BacklogError(
        `The backlog already lists the same work twice: lines ` +
          `${clash.index + 1} and ${entry.index + 1}. Repair it by hand ` +
          `before running this operation.`,
      );
    }
  }
}

export function parseBacklog(source) {
  const { lines, newline, hasFinalNewline } = splitSource(source);

  const headings = [];
  lines.forEach((line, index) => {
    if (line.startsWith("## ")) {
      headings.push({ title: line.slice(3).trim(), index });
    }
  });

  const taken = sectionFor(lines, headings, takenHeading);
  const queue = sectionFor(lines, headings, queueHeading);
  const entries = [...readSection(lines, taken), ...readSection(lines, queue)];
  requireDistinctWork(entries);

  return { lines, newline, hasFinalNewline, taken, queue, entries };
}

export function renderBacklog(document) {
  return joinSource(document);
}

// The one shape of a missing-input refusal. Each operation supplies the hint
// that suits it, because what to do about a missing value differs between
// writing a new entry and naming an entry the backlog already carries.
export function requireField(value, field, hint = "") {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BacklogError(`Missing ${field}: supply --${field}.${hint}`);
  }
}

// An identity must already be named by the canonical home it points at. This
// establishes which token, if any, the written entry carries.
function tokenFor(identity, href) {
  const { path, anchor } = splitHref(href);

  if (identity.includes("#")) {
    const { path: token, anchor: expected } = splitHref(identity);
    if (expected !== anchor) {
      throw ambiguousHome(
        `identity "${identity}" names anchor "${expected}" but the link ` +
          `names "${anchor || "no anchor"}".`,
      );
    }
    if (token === "" || !path.includes(token)) {
      throw ambiguousHome(
        `identity "${identity}" names "${token}" but the link path ` +
          `"${path}" does not.`,
      );
    }
    return token;
  }

  if (identity.includes("/")) {
    if (identity !== href) {
      throw ambiguousHome(
        `path identity "${identity}" does not match the link "${href}".`,
      );
    }
    return "";
  }

  if (anchor !== "") {
    throw ambiguousHome(
      `identity "${identity}" names no anchor but the link names ` +
        `"${anchor}".`,
    );
  }
  if (!path.includes(identity)) {
    throw ambiguousHome(
      `identity "${identity}" is not named by the link path "${path}".`,
    );
  }
  return identity;
}

export function renderEntry({ identity, title, href, plan }) {
  requireField(identity, "identity", ` ${adoptionHint}`);
  requireField(title, "title");
  requireField(href, "link");
  if (/[[\]]/.test(title)) {
    throw new BacklogError(`Unsupported title characters: ${title}`);
  }
  if (/[\s)]/.test(href)) {
    throw new BacklogError(`Unsupported link characters: ${href}`);
  }

  const token = tokenFor(identity, href);
  const detail = token === "" ? "" : `${separator}${token}`;
  const active = plan ? ` ([${plan.label}](${plan.target}))` : "";
  const line = `- [${title}](${href})${detail}${active}`;

  const rendered = readEntry(line, 0, queueHeading);
  if (rendered.identity !== identity) {
    throw ambiguousHome(
      `the written entry would read as identity "${rendered.identity}".`,
    );
  }
  return line;
}
