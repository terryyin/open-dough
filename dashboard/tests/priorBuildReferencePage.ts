// Membership in PriorBuildReferenceEvidenceList, shared by build, scope and
// follow-up readings. Expected dates, values, reasons and provenance stay with callers.
import type { Locator } from "@playwright/test";

export function priorBuildReferenceReading(scope: Locator) {
  const evidence = scope.getByRole("group", {
    name: "Prior-build reference evidence",
  });
  return {
    evidence,
    included: evidence.getByText(/✓ Included/),
    excluded: evidence.getByText(/× Excluded/),
    selected: evidence.getByText(/◆ Selected/),
  };
}
