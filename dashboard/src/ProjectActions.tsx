import { RefreshCw } from "lucide-react";
import { CheckedAt } from "./CheckedAt.tsx";
import { IconButton } from "./Icon.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { OpenTerminal } from "./pageSessions.ts";
import { NearFutureDirection } from "./NearFutureDirection.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { StartSession, type AdHocLaunches } from "./StartSession.tsx";
import { maintenanceRowText } from "./feedbackMaintenanceState.ts";

// Actions for the selected project's stories, independent of a URL destination.
// In the project feedback maintenance runs in, a line beside Start session
// says when it is running or still due (`./feedbackMaintenanceState.ts`).
// Once origin confirmed the shown revision, the row ends with when, and a
// Refresh that checks origin again, unavailable yet focusable meanwhile.
export function ProjectActions({
  source,
  work,
  launches,
  presentTerminal,
  hidden,
  checking,
  refresh,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly launches: AdHocLaunches &
    Pick<MachineSessions, "feedbackMaintenance">;
  readonly presentTerminal: OpenTerminal;
  readonly hidden: boolean;
  readonly checking: boolean;
  readonly refresh: () => void;
}) {
  const showsPreparation =
    work &&
    [...work.taken, ...work.backlog].some(
      (entry) => entry.preparation !== undefined,
    );
  const maintenance = launches.feedbackMaintenance;
  const maintenanceRow =
    maintenance?.source === source.id ? maintenance.row : undefined;
  return (
    <div className="project-actions" hidden={hidden}>
      {work && (
        <NearFutureDirection key={source.id} direction={work.direction} />
      )}
      <div className="project-actions-end">
        {maintenanceRow !== undefined && (
          <p role="status" className="quiet feedback-maintenance-due">
            {maintenanceRowText(maintenanceRow)}
          </p>
        )}
        <StartSession
          sourceId={source.id}
          project={source.label}
          launches={launches}
          presentTerminal={presentTerminal}
        />
        {showsPreparation && <PreparationLegend />}
        {work?.confirmedAt !== undefined && (
          <>
            <p className="quiet board-checked-at">
              <CheckedAt at={work.confirmedAt} />
            </p>
            <IconButton
              label="Refresh"
              icon={RefreshCw}
              aria-disabled={checking}
              onClick={() => {
                if (!checking) refresh();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
