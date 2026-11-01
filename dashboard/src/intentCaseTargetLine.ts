// Resolve a recorded case target against published file text for Intent
// Purpose positioning. A numeric `path:line` target is that 1-based line when
// in range. A `path::name` (or named Gherkin scenario) target is the only
// line that contains the name; zero or several matches leave Purpose at the
// file start.

function isLineNumberCaseTarget(caseTarget: string): boolean {
  return /^\d+$/.test(caseTarget);
}

export function resolveCaseTargetLine(
  text: string,
  caseTarget: string,
): number | undefined {
  if (caseTarget.length === 0) return undefined;
  const lines = text.length === 0 ? [""] : text.split("\n");
  if (isLineNumberCaseTarget(caseTarget)) {
    const line = Number(caseTarget);
    if (line >= 1 && line <= lines.length) return line;
    return undefined;
  }
  let only: number | undefined;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line === undefined || !line.includes(caseTarget)) continue;
    if (only !== undefined) return undefined;
    only = index + 1;
  }
  return only;
}

/** Recorded case text shown beside a location link (`:line` or `::name`). */
export function recordedCaseSuffix(caseTarget: string): string {
  return isLineNumberCaseTarget(caseTarget)
    ? `:${caseTarget}`
    : `::${caseTarget}`;
}
