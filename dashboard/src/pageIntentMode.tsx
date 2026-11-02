// The Intent perspective's chosen reading mode (`./IntentModeTabs.tsx`):
// disposable page state (ADR 0008), not part of the URL, kept by the page
// (`./PageFrame.tsx`) beside story selection so it outlasts Intent's own
// mount. It belongs to the project the page shows: switching to Development
// and back, or a new revision, keeps it, and a project change starts again on
// Intent. It is not tied to a revision, so a choice made before the revision
// is read holds once it is.

import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import type { IntentMode } from "./IntentModeTabs.tsx";

export type ModeChoice = {
  readonly mode: IntentMode;
  readonly modeIdPrefix: string;
  readonly onModeChange: (next: IntentMode) => void;
};

type Kept = { readonly project: string; readonly mode: IntentMode };

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
  const [kept, keep] = useState<Kept>({ project, mode: "intent" });
  if (kept.project !== project) keep({ project, mode: "intent" });
  return <IntentModeOnPage value={{ kept, keep }}>{children}</IntentModeOnPage>;
}

// The chosen mode for `project` and its tab ids.
export function useIntentModeChoice(project: string): ModeChoice {
  const modeIdPrefix = useId();
  const page = useContext(IntentModeOnPage);
  if (page === undefined) {
    throw new Error("The Intent mode is used outside the page's PageFrame.");
  }
  const { kept, keep } = page;
  return {
    mode: kept.project === project ? kept.mode : "intent",
    modeIdPrefix,
    onModeChange: (next) => {
      keep({ project, mode: next });
    },
  };
}
