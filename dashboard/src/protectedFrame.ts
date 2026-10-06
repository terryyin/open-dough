// Why a story card's actions are unavailable while its story starts on this
// machine (`./WorkCard.tsx`): the card names what says so, its startup
// status, and every action button in the card's protected frame takes that
// as part of its accessible description, so a disabled action and its
// reason are found together by keyboard and screen-reader navigation.
// Outside a protected frame, as in Recently done, nothing is added.

import { createContext, useContext } from "react";

const ProtectedFrame = createContext<string | undefined>(undefined);

// Provides the id of the protected frame's reason, or nothing while the
// frame is not protected.
export const ProtectedFrameReason = ProtectedFrame.Provider;

// The ids a button is described by: its own, if any, then the reason of the
// protected frame it is in, if any.
export function useFrameDescription(
  ...own: readonly (string | undefined)[]
): string | undefined {
  const reason = useContext(ProtectedFrame);
  const ids = [...own, reason].filter((id) => id !== undefined);
  return ids.length > 0 ? ids.join(" ") : undefined;
}
