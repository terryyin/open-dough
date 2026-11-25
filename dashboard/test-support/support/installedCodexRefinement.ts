// A real refinement installation for both hosts, with a second Codex
// definition published after the launch dialog has read the first one.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { withInstallation } from "./startOriginInstallation.ts";
import { repoRoot } from "./repositoryRoot.ts";

const skill = "dough-story-refinement";
const skillFolder = `.agents/skills/${skill}`;
const codexOptions = `${skillFolder}/references/refinement-options.json`;

export function codexRefinementOptionsRevision(flag: string) {
  const option = makeMe.anOptionsEntry
    .with({
      flag,
      label: "Codex option",
      summary: "Selected in Codex.",
      instruction: "Investigate.",
    })
    .please();
  return {
    message: "Set the Codex refinement option",
    files: {
      [codexOptions]: JSON.stringify(
        makeMe.anOptionsDefinition
          .with({ command: skill, options: [option] })
          .please(),
      ),
    },
  };
}

export function codexRefinementRepository(flag: string) {
  return withInstallation(
    queuedRepositoryWithRoughStory(roughStoryC)
      .withRevision("codex-options", codexRefinementOptionsRevision(flag))
      .please(),
    "codex",
    path.join(repoRoot, "Distribution", "src", "skills"),
  );
}
