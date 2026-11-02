// The Intent perspective's chosen reading mode (`./IntentModeTabs.tsx`),
// owned by `./IntentPerspective.tsx`: it belongs to one project at one
// revision, so another project, or a revision other than the one it was
// chosen at, starts on Intent. A choice made before the revision was read
// holds once it is.

import { useId, useState } from "react";
import type { IntentMode } from "./IntentModeTabs.tsx";

export type ModeChoice = {
  readonly mode: IntentMode;
  readonly modeIdPrefix: string;
  readonly onModeChange: (next: IntentMode) => void;
};

export function useIntentModeChoice(
  sourceId: string,
  revision: string | undefined,
): ModeChoice {
  const modeIdPrefix = useId();
  const [chosen, setChosen] = useState<{
    readonly sourceId: string;
    readonly revision: string | undefined;
    readonly mode: IntentMode;
  }>({ sourceId, revision, mode: "intent" });
  const mode =
    chosen.sourceId === sourceId &&
    (chosen.revision === undefined ||
      revision === undefined ||
      chosen.revision === revision)
      ? chosen.mode
      : "intent";
  return {
    mode,
    modeIdPrefix,
    onModeChange: (next) => {
      setChosen({ sourceId, revision, mode: next });
    },
  };
}
