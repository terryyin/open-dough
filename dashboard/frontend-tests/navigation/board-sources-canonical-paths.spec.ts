// Open Sources on the path-mix Board and match Slice 1's exact detail request
// set (`../observation/published-detail-path-mix-supply.ts`).
import { createElement } from "react";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ConfiguredDashboard } from "../../src/ConfiguredDashboard.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { authenticatedSessionServices } from "../../src/sessionServices.ts";
import { withPagePreferences } from "../../test-support/component-mount/framePreferences.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  expectedDetailPaths,
  observationSupplying,
} from "../observation/published-detail-path-mix-supply.ts";
import {
  emptyMachineAnswer,
  forceRevisionStreamDelivery,
} from "./board-frame-observation-supply.ts";
import { boardReading as board } from "./board-reading-page.ts";

test("opening Sources on the path-mix Board asks exactly the Slice 1 detail paths", async () => {
  withPagePreferences();
  forceRevisionStreamDelivery();
  const source = makeMe.aPublishedSource.openDough.please();
  const { reads, detailPaths } = observationSupplying({});
  const machineAnswer = emptyMachineAnswer();
  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [source],
      replaceProjects: () => {},
      children: createElement(ConfiguredDashboard, {
        reads: pageReadsSupplying({
          sessions: authenticatedSessionServices,
          observation: {
            ...reads,
            checkRevision: () =>
              Promise.resolve({ changed: false, heads: new Map() }),
            subscribeRevision: () => ({ close: () => {} }),
          },
          machine: {
            readSessionsSince: () => Promise.resolve(machineAnswer),
            requestAcceptance: () =>
              Promise.resolve({
                kind: "failed",
                explanation: "Sources proof does not accept launches.",
              }),
          },
        }),
        settingsOpen: false,
        onOpenSettings: () => {},
        onDashboardReady: () => {},
      }),
    }),
    { viewport: { width: 1440, height: 900 }, fillsViewport: true },
  );

  const story = board.column("Taken").getByRole("article", {
    name: "See the project's published work in a story dashboard",
    exact: true,
  });
  await expect.element(story).toBeVisible();
  await expect
    .poll(() => [...new Set(detailPaths)].sort())
    .toEqual(expectedDetailPaths);

  await story.getByRole("button", { name: "Inspect story" }).click();
  const sources = story.getByRole("list", { name: "Pinned source links" });
  await expect.element(sources).toBeVisible();
  await expect
    .element(
      sources.getByRole("link", {
        name: /Canonical record/,
      }),
    )
    .toBeVisible();
  await expect
    .element(sources.getByRole("link", { name: /Slice plan/ }))
    .toBeVisible();
  expect([...new Set(detailPaths)].sort()).toEqual(expectedDetailPaths);
});
