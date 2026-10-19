import type { MachineSessions } from "./agentLaunches.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { NearFutureDirection } from "./NearFutureDirection.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import { StartSession } from "./StartSession.tsx";

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
