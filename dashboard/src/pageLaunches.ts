// The machine's launches the page owns (`./agentLaunches.ts`), available to
// any control that starts a session without threading Board props: a Done
// story's file Follow up in Review changes or Intent
// (`./StoryAnchoredFollowUp.tsx`).

import { createContext, useContext } from "react";
import type { MachineSessions } from "./agentLaunches.ts";

export const LaunchesOnPage = createContext<MachineSessions | undefined>(
  undefined,
);

export function usePageLaunches(): MachineSessions {
  const launches = useContext(LaunchesOnPage);
  if (launches === undefined) {
    throw new Error("A launch control is shown outside the page's launches.");
  }
  return launches;
}
