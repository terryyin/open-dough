// One Intent selection for the project's Intent workspace: the selected
// file path and an optional case target later slices position Purpose on.
// Disposable page state (ADR 0008). The provider remounts on source or
// revision identity so selection clears with that identity
// (`./IntentPerspective.tsx`). The location tree and Purpose read and set
// it through this owner; the candidate-record view shares it when opening
// a recorded location.

import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type IntentSelection = {
  readonly path: string;
  readonly caseTarget?: string;
};

/** Open a configured Intent file from a candidate-record entry. */
export type OpenCandidateLocation = (
  selection: IntentSelection,
  entrySlug: string,
) => void;

export type IntentWorkspaceSelection = {
  readonly selection: IntentSelection;
  readonly setSelection: (next: IntentSelection) => void;
};

const emptySelection: IntentSelection = { path: "" };

const IntentSelectionContext = createContext<
  IntentWorkspaceSelection | undefined
>(undefined);

export function IntentWorkspaceSelectionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [selection, setSelection] = useState<IntentSelection>(emptySelection);
  return createElement(
    IntentSelectionContext.Provider,
    { value: { selection, setSelection } },
    children,
  );
}

export function useIntentWorkspaceSelection(): IntentWorkspaceSelection {
  const owned = useContext(IntentSelectionContext);
  if (owned === undefined) {
    throw new Error(
      "Intent selection is used outside the project's Intent workspace.",
    );
  }
  return owned;
}
