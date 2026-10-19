import type { MachineSessions } from "./agentLaunches.ts";
import { NearFutureDirection } from "./NearFutureDirection.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { StartSession } from "./StartSession.tsx";

// Actions for the selected project's stories, independent of a URL destination.
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
  return (
    <div className="project-actions" hidden={hidden}>
      {work && (
        <NearFutureDirection key={source.id} direction={work.direction} />
      )}
      <div className="project-actions-end">
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
