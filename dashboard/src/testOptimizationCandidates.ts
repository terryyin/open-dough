// Parse a published Test Optimization Candidates record for Intent into
// either version's shape, by that version's section headings and entry fields
// (`./testOptimizationCandidatesRecord.ts`). The format owner is
// dough-test-optimization's candidate-record reference. Under the exact
// title, the live record has one `## Live candidates` section; the earlier
// four-section record has its four finding sections in order, after an
// optional leading `## Latest pass` summary that Intent does not show. A
// section holds `###` slug entries with its version's labelled fields, or
// exactly `None.`. Only Profile-only exclusions may open with a note naming
// the project's exclusion mechanism. Any other shape is mismatched; this
// shows no partial guess.

import {
  findingEntryFields,
  findingSections,
  liveCandidateFields,
  liveSectionHeading,
  type CandidateFieldDefinition,
  type FindingEntry,
  type FindingSection,
  type LiveCandidateEntry,
  type RecordSection,
  type TestOptimizationCandidatesRecord,
} from "./testOptimizationCandidatesRecord.ts";

export { testOptimizationCandidatesPath } from "./testOptimizationCandidatesPath.ts";

const title = "# Test Optimization Candidates";

const leadingPassSummary = "Latest pass";

type FindingKey = (typeof findingSections)[number]["key"];

// The one finding section that may open with a note before its entries.
const noteSection: FindingKey = "profileOnly";

export type ParsedTestOptimizationCandidates =
  | { readonly status: "mismatched" }
  | {
      readonly status: "record";
      readonly record: TestOptimizationCandidatesRecord;
      // The live section is `None.`, or a four-section record's pending and
      // accepted finding sections are both exactly `None.`.
      readonly empty: boolean;
    };

const mismatched = { status: "mismatched" } as const;

type Section = { readonly heading: string; readonly body: string };

// The `##` sections under the exact title, or undefined without that title.
function sectionsOf(text: string): readonly Section[] | undefined {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  if (!normalized.startsWith(`${title}\n`) && normalized !== title) {
    return undefined;
  }
  const body = normalized.slice(title.length).replace(/^\n/, "");
  const matches = [...body.matchAll(/^## (.+)$/gm)];
  return matches.map((match, i) => ({
    heading: match[1] ?? "",
    body: body
      .slice(match.index + match[0].length, matches[i + 1]?.index)
      .replace(/^\n/, "")
      .trimEnd(),
  }));
}

// An entry's labelled fields by key, or undefined when a label is unknown or
// repeated, text precedes the first field, or a required field is missing.
function parseFields(
  body: string,
  fields: readonly CandidateFieldDefinition[],
): Record<string, string> | undefined {
  const knownLabels = new Set(fields.map((field) => field.label));
  const values = new Map<string, string[]>();
  let current: string | undefined;
  for (const line of body.split("\n")) {
    const field = /^- \*\*(.+):\*\*(?:\s(.*))?$/.exec(line);
    if (field !== null) {
      const label = field[1];
      if (label === undefined || !knownLabels.has(label) || values.has(label)) {
        return undefined;
      }
      current = label;
      values.set(label, field[2] === undefined ? [] : [field[2]]);
      continue;
    }
    if (current === undefined) {
      if (line.trim() === "") continue;
      return undefined;
    }
    values.get(current)?.push(line);
  }
  const entry: Record<string, string> = {};
  for (const field of fields) {
    const value = values.get(field.label);
    if (value === undefined) {
      if (field.required) return undefined;
      continue;
    }
    entry[field.key] = value.join("\n").trimEnd();
  }
  return entry;
}

function parseSection<Entry extends { readonly slug: string }>(
  body: string,
  fields: readonly CandidateFieldDefinition[],
  noteAllowed: boolean,
): RecordSection<Entry> | undefined {
  const trimmed = body.trim();
  if (trimmed === "None.") return { kind: "none" };
  const matches = [...trimmed.matchAll(/^### (.+)$/gm)];
  const first = matches[0];
  if (first === undefined) return undefined;
  const note = trimmed.slice(0, first.index).trim();
  if (note !== "" && !noteAllowed) return undefined;
  const entries: Entry[] = [];
  for (const [i, match] of matches.entries()) {
    const slug = match[1]?.trim();
    if (slug === undefined || slug === "") return undefined;
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? trimmed.length;
    const parsed = parseFields(
      trimmed.slice(start, end).replace(/^\n/, ""),
      fields,
    );
    if (parsed === undefined) return undefined;
    // `fields` are Entry's: every required one is present.
    entries.push({ slug, ...parsed } as Entry);
  }
  return note === ""
    ? { kind: "entries", entries }
    : { kind: "entries", entries, note };
}

function parseFourSections(
  sections: readonly Section[],
): ParsedTestOptimizationCandidates {
  if (sections.length !== findingSections.length) return mismatched;
  const findings = {} as Record<FindingKey, FindingSection>;
  for (const [i, { heading, key }] of findingSections.entries()) {
    const section = sections[i];
    if (section?.heading !== heading) return mismatched;
    const parsed = parseSection<FindingEntry>(
      section.body,
      findingEntryFields,
      key === noteSection,
    );
    if (parsed === undefined) return mismatched;
    findings[key] = parsed;
  }
  return {
    status: "record",
    empty:
      findings.pending.kind === "none" && findings.accepted.kind === "none",
    record: { version: "four-section", ...findings },
  };
}

// Parse published Markdown into either version's record shape, or
// mismatched with no partial sections.
export function parseTestOptimizationCandidates(
  text: string,
): ParsedTestOptimizationCandidates {
  const sections = sectionsOf(text);
  if (sections === undefined) return mismatched;
  const [first] = sections;
  if (sections.length === 1 && first?.heading === liveSectionHeading) {
    const live = parseSection<LiveCandidateEntry>(
      first.body,
      liveCandidateFields,
      false,
    );
    if (live === undefined) return mismatched;
    return {
      status: "record",
      empty: live.kind === "none",
      record: { version: "live", live },
    };
  }
  return parseFourSections(
    first?.heading === leadingPassSummary ? sections.slice(1) : sections,
  );
}
