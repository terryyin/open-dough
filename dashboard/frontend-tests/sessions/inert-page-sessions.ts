// The page's session operations for a mounted component whose case does not
// operate them: Claude hosts attach and mark done locally, no session is
// shown, and every operation answers at once without effect. Cases mount it
// through `SessionsOnPage` (`../../src/pageSessions.ts`).

import type { PageSessions } from "../../src/pageSessions.ts";

export const inertPageSessions: PageSessions = {
  hostOperations: {
    claude: {
      attach: true,
      stop: false,
      doneStop: false,
      localDone: true,
      launchedSessions: true,
    },
  },
  presentTerminal: () => undefined,
  openSession: () => undefined,
  shownSession: undefined,
  markDone: () => Promise.resolve("marked"),
  markRead: () => Promise.resolve(true),
  deleteRecord: () => Promise.resolve({ kind: "deleted" }),
  recoverSession: () => Promise.resolve(undefined),
  stopSession: () => Promise.resolve(undefined),
};
