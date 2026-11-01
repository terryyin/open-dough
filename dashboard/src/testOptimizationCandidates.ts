// Parse a published Test Optimization Candidates record for Intent. The
// format owner is dough-test-optimization's candidate-record reference:
// exact title, five sections in order, `###` slug entries with labelled
// fields, and `None.` for an empty finding section. Any other shape is
// mismatched; this shows no partial guess.

export { testOptimizationCandidatesPath } from "./testOptimizationCandidatesPath.ts";

const title = "# Test Optimization Candidates";

const sectionHeadings = [
  "Latest pass",
  "Pending candidates",
  "Accepted necessary costs",
  "Profile-only exclusions",
  "Transferred obligations",
] as const;

type SectionHeading = (typeof sectionHeadings)[number];

const findingSections = [
  "Pending candidates",
  "Accepted necessary costs",
  "Profile-only exclusions",
  "Transferred obligations",
] as const;

type FindingHeading = (typeof findingSections)[number];

// One authoritative field order and wording for parse and Intent display.
export const candidateEntryFields = [
  { label: "Locations / scope", key: "locations", required: true },
  { label: "Observed cost", key: "observedCost", required: true },
  { label: "Unique protection", key: "uniqueProtection", required: true },
  {
    label: "Alternatives attempted",
    key: "alternativesAttempted",
    required: true,
  },
  {
    label: "Disposition / rationale",
    key: "dispositionRationale",
    required: true,
  },
  { label: "Date", key: "date", required: true },
  {
    label: "Human decision needed",
    key: "humanDecisionNeeded",
    required: false,
  },
  { label: "Evidence / follow-up", key: "evidence", required: true },
] as const;

type CandidateField = (typeof candidateEntryFields)[number];
type RequiredCandidateField = Extract<CandidateField, { required: true }>;
type OptionalCandidateField = Extract<CandidateField, { required: false }>;

export type CandidateEntry = {
  readonly slug: string;
} & {
  readonly [K in RequiredCandidateField["key"]]: string;
} & {
  readonly [K in OptionalCandidateField["key"]]?: string;
};

export type FindingSection =
  | { readonly kind: "none" }
  | { readonly kind: "entries"; readonly entries: readonly CandidateEntry[] };

export type TestOptimizationCandidatesRecord = {
  readonly latestPass: string;
  readonly pending: FindingSection;
  readonly accepted: FindingSection;
  readonly profileOnly: FindingSection;
  readonly transferred: FindingSection;
};

export type ParsedTestOptimizationCandidates =
  | { readonly status: "mismatched" }
  | {
      readonly status: "record";
      readonly record: TestOptimizationCandidatesRecord;
      // Both pending and accepted finding sections are exactly `None.`.
      readonly empty: boolean;
    };

function splitSections(
  text: string,
): ReadonlyMap<SectionHeading, string> | undefined {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  if (!normalized.startsWith(`${title}\n`) && normalized !== title) {
    return undefined;
  }
  const body = normalized.slice(title.length).replace(/^\n/, "");
  const headingPattern = /^## (.+)$/gm;
  const matches = [...body.matchAll(headingPattern)];
  if (matches.length !== sectionHeadings.length) return undefined;
  const sections = new Map<SectionHeading, string>();
  for (const [i, match] of matches.entries()) {
    const heading = match[1];
    const expected = sectionHeadings[i];
    if (
      heading === undefined ||
      expected === undefined ||
      heading !== expected
    ) {
      return undefined;
    }
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? body.length;
    sections.set(heading, body.slice(start, end).replace(/^\n/, "").trimEnd());
  }
  return sections;
}

const knownLabels: ReadonlySet<string> = new Set(
  candidateEntryFields.map((field) => field.label),
);

function parseFields(body: string): Omit<CandidateEntry, "slug"> | undefined {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const values = new Map<string, string[]>();
  let current: string | undefined;
  for (const line of lines) {
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
  const join = (label: string) =>
    (values.get(label) ?? []).join("\n").trimEnd();
  const entry = {} as Record<string, string>;
  for (const field of candidateEntryFields) {
    if (field.required) {
      if (!values.has(field.label)) return undefined;
      entry[field.key] = join(field.label);
      continue;
    }
    if (values.has(field.label)) {
      entry[field.key] = join(field.label);
    }
  }
  return entry as Omit<CandidateEntry, "slug">;
}

function parseFindingSection(body: string): FindingSection | undefined {
  const trimmed = body.trim();
  if (trimmed === "None.") return { kind: "none" };
  if (trimmed === "") return undefined;
  const entryPattern = /^### (.+)$/gm;
  const matches = [...trimmed.matchAll(entryPattern)];
  if (matches.length === 0) return undefined;
  const first = matches[0];
  if (first === undefined || trimmed.slice(0, first.index).trim() !== "") {
    return undefined;
  }
  const entries: CandidateEntry[] = [];
  for (const [i, match] of matches.entries()) {
    const slug = match[1]?.trim();
    if (slug === undefined || slug === "") return undefined;
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? trimmed.length;
    const fields = parseFields(trimmed.slice(start, end).replace(/^\n/, ""));
    if (fields === undefined) return undefined;
    entries.push({ slug, ...fields });
  }
  return { kind: "entries", entries };
}

// Parse published Markdown into the record shape, or mismatched with no
// partial sections.
export function parseTestOptimizationCandidates(
  text: string,
): ParsedTestOptimizationCandidates {
  const sections = splitSections(text);
  if (sections === undefined) return { status: "mismatched" };
  const latestPass = sections.get("Latest pass");
  if (latestPass === undefined || latestPass.trim() === "") {
    return { status: "mismatched" };
  }
  const findings = {} as Record<FindingHeading, FindingSection>;
  for (const heading of findingSections) {
    const body = sections.get(heading);
    if (body === undefined) return { status: "mismatched" };
    const parsed = parseFindingSection(body);
    if (parsed === undefined) return { status: "mismatched" };
    findings[heading] = parsed;
  }
  const pending = findings["Pending candidates"];
  const accepted = findings["Accepted necessary costs"];
  return {
    status: "record",
    empty: pending.kind === "none" && accepted.kind === "none",
    record: {
      latestPass: latestPass.trimEnd(),
      pending,
      accepted,
      profileOnly: findings["Profile-only exclusions"],
      transferred: findings["Transferred obligations"],
    },
  };
}
