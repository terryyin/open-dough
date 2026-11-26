// A project read from Project Intent CI at published revision A while trunk
// has already moved to B (../../e2e/intent/intent-file-purpose-proof.spec.ts):
// one real history where B rewrites a production file, a neighboring
// document and a configured test, and CI's measured build stays run 41 at the
// judged ancestor (./intentSummaryCiProofFixtures.ts).

import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedFileHistory } from "./committedFiles.ts";
import { openDough, openDoughSettings } from "./intentCodeBrowseFixtures.ts";
import {
  openPublishedIntent,
  spec,
  summaryTreeSources,
} from "./intentSummaryCiProofFixtures.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { intentSettingsText } from "./support/intentSettingsFile.ts";

export const browsedAt = (at: "A" | "B") => ({
  "dashboard/src/login.ts": `export const login = "login at ${at}";\n`,
  "docs/login.md": `# Login at ${at}\n`,
  "dashboard/tests/folder/a.spec.ts": spec(`a at ${at}`),
});

// Intent opened on CI status at A, its trunk then moved to B.
export async function openIntentAtABeforeB(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
  zip: () => OriginAnswer | Promise<OriginAnswer>,
) {
  const history = makeMe.aRepository
    .withRevision("A", {
      message: "Publish login",
      files: {
        ...openDough.files,
        ".planning/open-dough.json": intentSettingsText(openDoughSettings),
        ...summaryTreeSources,
        ...browsedAt("A"),
      },
    })
    .withRevision("B", {
      message: "Rewrite login",
      parents: ["A"],
      files: browsedAt("B"),
    })
    .please();
  const project = await publishCommittedFileHistory(page, history, {
    repository: openDough.repository,
    trunk: "A",
    afterGitHubStops,
  });
  let head = project.revisions.A;
  const opened = await openPublishedIntent(page, project, () => head, { zip });
  // The opening judgment reads A's history and runs; trunk moves only once
  // it is answered.
  await untilPageReadsAnswered(page);
  head = project.revisions.B;
  project.moveTrunk(project.at("B"));
  return opened;
}
