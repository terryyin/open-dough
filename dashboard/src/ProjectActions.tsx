import type { MachineSessions } from "./agentLaunches.ts";
import { NearFutureDirection } from "./NearFutureDirection.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { StartSession } from "./StartSession.tsx";
import { maintenanceRowText } from "./feedbackMaintenanceState.ts";

// Actions for the selected project's stories, independent of a URL destination.
// In the project feedback maintenance runs in, a line beside Start session
// says when it is running or still due (`./feedbackMaintenanceState.ts`).
export function ProjectActions({
  source,
  work,
  launches,
  hidden,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly launches: MachineSessions;
  readonly hidden: boolean;
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
          attempt={launches.adHocAttemptOf(source.id)}
          sessionPolicy={(host) =>
            launches.sessionPolicyOffer(source.id, "ad-hoc", host)
          }
          onHostChanged={launches.rereadOffers}
          onStart={(choices, onLaunched) =>
            launches.startAdHoc(source.id, choices, onLaunched)
          }
        />
        {showsPreparation && <PreparationLegend />}
      </div>
    </div>
  );
}
