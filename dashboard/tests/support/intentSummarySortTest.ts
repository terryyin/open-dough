// Sort reads actual private declared history; installed CLI publication stays
// in the source journeys. Its configured checkout and GitHub read the same graph.
import { test as base } from "../dashboardTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { projectConfigurationMachine } from "./projectConfigurationMachine.ts";
import { materializeDeclaredSummaryComparisonRepository } from "./intentSummaryStoryComparisonRepository.ts";

export { expect } from "../dashboardTest.ts";

type ComparisonRepository = Awaited<
  ReturnType<typeof materializeDeclaredSummaryComparisonRepository>
> & { readonly machine: string };

export const test = base.extend<{ comparisonRepository: ComparisonRepository }>(
  {
    comparisonRepository: async (
      { afterGitHubStops, dashboardPreviewReady },
      use,
    ) => {
      await Promise.resolve(dashboardPreviewReady);
      const configuration = projectConfigurationMachine();
      afterGitHubStops(() => configuration.close());
      const built = await materializeDeclaredSummaryComparisonRepository(
        configuration.machine,
      );
      afterGitHubStops(built.cleanup);
      configuration.save(
        JSON.stringify([
          makeMe.aConfiguredProject
            .with({
              id: "open-dough",
              label: "Open Dough",
              repository: "terryyin/open-dough",
              ref: "main",
              backlogPath: ".planning/PRODUCT-BACKLOG.md",
              localPath: built.integration,
            })
            .please(),
        ]),
      );
      await use({ ...built, machine: configuration.machine });
    },
    machine: async ({ comparisonRepository }, use) => {
      await use(comparisonRepository.machine);
    },
  },
);
