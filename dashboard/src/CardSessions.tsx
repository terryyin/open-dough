// A card's open sessions (`./CardLaunches.tsx`): newest first, each shown as
// Recently done shows it without the story the card already names, under
// how many of them need attention, when any do (`attentionSummary`), and, in
// a line of its own, how many hold unread reports, when any do
// (`unreadReportSummary`).

import type { LaunchWithState } from "./agentLaunch.ts";
import { StorySessions } from "./SessionEntry.tsx";
import { attentionSummary, unreadReportSummary } from "./sessionShown.ts";

export function CardSessions({
  sessions,
  launchedHere,
}: {
  // The story's sessions not marked done, oldest first.
  sessions: readonly LaunchWithState[];
  // The session the developer's own launch from the card just listed.
  launchedHere: string | undefined;
}) {
  const attention = attentionSummary(sessions);
  const unreadReports = unreadReportSummary(sessions);
  return (
    <>
      {attention !== undefined && <p className="card-attention">{attention}</p>}
      {unreadReports !== undefined && (
        <p className="card-unread-reports">{unreadReports}</p>
      )}
      <StorySessions
        sessions={sessions}
        className="card-sessions"
        onCard
        launchedHere={launchedHere}
      />
    </>
  );
}
