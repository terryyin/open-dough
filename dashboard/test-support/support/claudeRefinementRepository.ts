// Revisions applied to the installed Claude refinement skill in the story fixture.
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { queuedDashboardRepository } from "../launchJourney.ts";

export const claudeRefinementSkill = ".claude/skills/dough-story-refinement";
export const claudeRefinementOptions = `${claudeRefinementSkill}/references/refinement-options.json`;

export function refinementOptionsRevision(definition: unknown): RevisionFacts {
  return {
    message: "Change the Claude refinement options",
    files: { [claudeRefinementOptions]: JSON.stringify(definition) },
  };
}

export const noRefinementOptions = {
  message: "Remove the Claude refinement options",
  remove: [claudeRefinementOptions],
} satisfies RevisionFacts;

export function claudeRefinementRepository(variant?: RevisionFacts) {
  const queued = queuedDashboardRepository();
  return variant === undefined
    ? queued.please()
    : queued.withRevision("installed-options", variant).please();
}
