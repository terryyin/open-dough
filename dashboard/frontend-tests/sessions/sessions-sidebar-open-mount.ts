import { createElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { PageFrame } from "../../src/PageFrame.tsx";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { SessionServices } from "../../src/sessionServices.ts";
import {
  sidebarKey,
  withFramePreference,
  withPagePreferences,
} from "../../test-support/component-mount/framePreferences.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();

export function observe(
  records: readonly { record: LaunchRecord; state: SessionState }[],
): MachineAnswer {
  return makeMe.aMachineAnswer
    .observing(
      ...records.map(({ record, state }) =>
        makeMe.anObservedLaunch.of(record).withSessionState(state).please(),
      ),
    )
    .please();
}

const projects = [doughnut];
const unreadAnswer = makeMe.aMachineAnswer.please();
const doNothing = () => {};
const readUnavailableHost: SessionServices["readHostStatus"] = () =>
  Promise.resolve(
    makeMe.aHostStatus.with({ cpuPercent: null, freeBytes: null }).please(),
  );

export async function mountOpenSessions(
  answer: MachineAnswer | undefined,
  readHostStatus: SessionServices["readHostStatus"] = readUnavailableHost,
) {
  withFramePreference(sidebarKey, "true");
  withPagePreferences({ sessionsSidebar: "kept" });
  const defaults = pageReadsSupplying({});
  const reads = pageReadsSupplying({
    sessions: { ...defaults.sessions, readHostStatus },
  });
  const reading = (next: MachineAnswer | undefined) => {
    const machine = machineSessionsAnswering({ answer: next ?? unreadAnswer });
    return createElement(PageReadsOnPage, {
      reads,
      children: createElement(ProjectsOnPage, {
        projects,
        replaceProjects: doNothing,
        children: createElement(PageFrame, {
          sessions: { ...machine, records: next?.records },
          stories: {
            selected: doughnut.id,
            shown: undefined,
            select: doNothing,
            show: doNothing,
            development: true,
            work: undefined,
          },
          children: createElement(DashboardBanner, {
            source: doughnut,
            perspective: "development",
            onOpenSettings: doNothing,
            onSelect: doNothing,
            onSelectPerspective: doNothing,
          }),
        }),
      }),
    });
  };
  const mounted = await mountComponent(reading(answer), {
    viewport: { width: 1280, height: 800 },
    fillsViewport: true,
  });
  return {
    supplySessions: (answer: MachineAnswer) => {
      mounted.rerender(reading(answer));
    },
  };
}
