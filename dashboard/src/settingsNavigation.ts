import { createContext } from "react";

// A deliberate configuration trip may return to an already-open launch draft.
export const SettingsNavigation = createContext<
  ((onReturn: () => void) => void) | undefined
>(undefined);
