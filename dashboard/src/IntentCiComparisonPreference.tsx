// One live Show % choice for the story's comparison and Changed tests scopes.
// Kept with that story's disposable reading place across project visits.
import { createContext, useContext, type ReactNode } from "react";
import { useKeptReading } from "./pageIntentReading.tsx";

export type ComparisonPreference = {
  readonly showPercent: boolean;
  readonly onShowPercent: (show: boolean) => void;
};
const ComparisonPreference = createContext<ComparisonPreference | undefined>(
  undefined,
);

export function IntentCiComparisonPreference({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [showPercent, onShowPercent] = useKeptReading(
    "ciShowPercent",
    () => false,
  );
  return (
    <ComparisonPreference value={{ showPercent, onShowPercent }}>
      {children}
    </ComparisonPreference>
  );
}

export function useCiComparisonPreference(): ComparisonPreference {
  const preference = useContext(ComparisonPreference);
  if (preference === undefined)
    throw new Error("CI comparison needs its story reading preference.");
  return preference;
}
