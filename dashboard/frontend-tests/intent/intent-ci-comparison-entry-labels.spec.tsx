// A Done story's CI entry timing comparison (../../src/IntentCiEntryComparison.tsx)
// names each entry by the label its read Intent location configures, opening
// that location, while an entry no read location matches stays its plain path.
// Comparison and cue rules are unchanged: ./intent-ci-comparison-entries.spec.ts.
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { useCiProofSorting } from "../../src/CiProofTable.tsx";
import { EntryComparisonView } from "../../src/IntentCiEntryComparison.tsx";
import { IntentCiEntryNavigation } from "../../src/IntentCiEntryLink.tsx";
import { comparisonEntriesOf } from "../../src/storyCiComparisonEntries.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { bodyRowsOf, cueOf, rowTextsOf } from "./intent-ci-comparison-page.ts";

const entry = (path: string, seconds: number) =>
  makeMe.aCiProofEntry
    .at(path)
    .counting(4, "file")
    .timed(seconds * 1000)
    .please();
const summary = (...entries: ReturnType<typeof entry>[]) =>
  ({ kind: "summary", entries }) as const;

const baseline = summary(
  entry("dashboard/tests", 120),
  entry("dashboard/frontend-tests", 60),
);
const candidate = summary(
  entry("e2e", 90),
  entry("dashboard/frontend-tests", 90),
);
const locations = [
  makeMe.anIntentLocation
    .at("e2e")
    .ofKind("typescript", ["**/*.spec.ts"])
    .labelled("E2E Test")
    .selecting("e2e/install.spec.ts")
    .please(),
  makeMe.anIntentLocation
    .at("dashboard/frontend-tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting("dashboard/frontend-tests/a.spec.ts")
    .please(),
];

function Comparison({ onOpen }: { readonly onOpen: (path: string) => void }) {
  return (
    <IntentCiEntryNavigation
      locations={locations}
      panelId="comparison"
      onOpen={onOpen}
    >
      <EntryComparisonView
        entries={comparisonEntriesOf(baseline, candidate, candidate)}
        sorting={useCiProofSorting()}
      />
    </IntentCiEntryNavigation>
  );
}

test("a removed historical path stays plain text and an added labelled entry shows its label, opens its location, and neither has a timing delta", async () => {
  const onOpen = vi.fn<(path: string) => void>();
  await mountComponent(<Comparison onOpen={onOpen} />);
  const table = page.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expect.element(table).toBeVisible();

  expect(rowTextsOf(table)).toEqual([
    [
      "E2E Test e2e",
      "added → 4 test files",
      "added",
      "1 min 30 s",
      "1 min 30 s",
    ],
    [
      "dashboard/frontend-tests",
      "4 test files (no change)",
      "1 min",
      "+30 s",
      "+30 s",
    ],
    [
      "dashboard/tests",
      "4 test files → removed",
      "2 min",
      "removed",
      "removed",
    ],
  ]);
  expect(bodyRowsOf(table).map(cueOf)).toMatchObject([
    { duration: "none", durationReason: "added" },
    { duration: "slower-strong" },
    { duration: "none", durationReason: "removed" },
  ]);
  await expect
    .element(table.getByRole("button", { name: "dashboard/tests" }))
    .not.toBeInTheDocument();
  await userEvent.click(
    table.getByRole("button", { name: "E2E Test", exact: true }),
  );
  expect(onOpen.mock.calls).toEqual([["e2e"]]);
});
