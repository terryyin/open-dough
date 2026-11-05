// One Intent selection for the project's Intent workspace: a configured
// location, a folder under one, or a file (with an optional case target later
// slices position Purpose on). Kept with the project's reading place
// (`./pageIntentReading.tsx`), so it outlasts leaving Intent and a new
// revision, and starts empty for each project. The location tree and Purpose
// read and set it through this owner; the candidate-record view shares it when
// opening a recorded file; directly activating the Intent reading tab clears
// it to return home (`./IntentModeTabs.tsx`). A missing `scope` with a
// non-empty path is a file, so candidate opens stay `{ path }` /
// `{ path, caseTarget }`.

import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from "react";
import { useKeptReading } from "./pageIntentReading.tsx";

export type IntentSelectionScope = "location" | "folder" | "file";

export type IntentSelection = {
  readonly path: string;
  readonly scope?: IntentSelectionScope;
  readonly caseTarget?: string;
};

/** What the selection names; empty path is none. */
export function selectionScope(
  selection: IntentSelection,
): "none" | IntentSelectionScope {
  if (selection.path === "") return "none";
  return selection.scope ?? "file";
}

/** Open a configured Intent file from a candidate-record entry. */
export type OpenCandidateLocation = (
  selection: IntentSelection,
  entrySlug: string,
) => void;

export type IntentWorkspaceSelection = {
  readonly selection: IntentSelection;
  readonly setSelection: (next: IntentSelection) => void;
  // Back to nothing selected, Intent's CI status homepage; nothing changes
  // when nothing is selected.
  readonly clearSelection: () => void;
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
  const [selection, setSelection] = useKeptReading<IntentSelection>(
    "selection",
    () => emptySelection,
  );
  return createElement(
    IntentSelectionContext.Provider,
    {
      value: {
        selection,
        setSelection,
        clearSelection: () => {
          if (selection.path !== "") setSelection(emptySelection);
        },
      },
    },
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
