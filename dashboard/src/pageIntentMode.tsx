// Project Intent's chosen view (`./intentProjectTabs.ts`), **CI status** or
// **Optimization Candidates**: disposable page state (ADR 0008), not part of
// the URL, kept by the page (`./PageFrame.tsx`) beside story selection so it
// outlasts Intent's own mount and a visit to the selected story. It belongs to
// the project the page shows and to its selected story, if any: switching to
// Development and back, or a new revision, keeps it, while a project change,
// a new selection or clearing one starts again on CI status. It is
// not tied to a revision, so a choice made before the revision is read holds
// once it is.

import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import type { IntentMode } from "./intentProjectTabs.ts";
import {
  useStorySelection,
  type SelectedStory,
} from "./pageStorySelection.tsx";

export type ModeChoice = {
  readonly mode: IntentMode;
  readonly modeIdPrefix: string;
  readonly onModeChange: (next: IntentMode) => void;
};

// The view chosen in `project` while `selection` was the page's selected story
// there (none when undefined).
type Kept = {
  readonly project: string;
  readonly selection: SelectedStory | undefined;
  readonly mode: IntentMode;
};

const IntentModeOnPage = createContext<
  | {
      readonly kept: Kept;
      readonly keep: (next: Kept) => void;
    }
  | undefined
>(undefined);

export function IntentModeProvider({
  project,
  children,
}: {
  // The project the developer has chosen to show.
  readonly project: string;
  readonly children: ReactNode;
}) {
  const [kept, keep] = useState<Kept>({
    project,
    selection: undefined,
    mode: "ci",
  });
  if (kept.project !== project)
    keep({ project, selection: undefined, mode: "ci" });
  return <IntentModeOnPage value={{ kept, keep }}>{children}</IntentModeOnPage>;
}

// The chosen mode for `project` and its tab ids.
export function useIntentModeChoice(project: string): ModeChoice {
  const modeIdPrefix = useId();
  const { selection } = useStorySelection(project);
  const page = useContext(IntentModeOnPage);
  if (page === undefined) {
    throw new Error("The Intent mode is used outside the page's PageFrame.");
  }
  const { kept, keep } = page;
  return {
    mode:
      kept.project === project && kept.selection === selection
        ? kept.mode
        : "ci",
    modeIdPrefix,
    onModeChange: (next) => {
      keep({ project, selection, mode: next });
    },
  };
}
