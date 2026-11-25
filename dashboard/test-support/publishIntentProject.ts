import type { Page } from "@playwright/test";
import type { IntentSettings } from "../../Distribution/tests/support/intentLocationTestData.mjs";
import type { CatalogPublication } from "./catalogProjectRecords.ts";
import { publishCommittedFiles } from "./committedFiles.ts";
import { intentSettingsText } from "./support/intentSettingsFile.ts";

// `published`'s files with `settings`, built through MakeMe or given as the
// exact settings text a case proves, and `sources` committed as its
// configured ref's one commit; returns that real revision and the requests.
export function publishIntentProject(
  page: Page,
  published: Pick<CatalogPublication, "repository" | "ref" | "files">,
  settings: IntentSettings | string,
  sources: Readonly<Record<string, string>>,
) {
  return publishCommittedFiles(page, {
    repository: published.repository,
    ref: published.ref,
    files: {
      ...published.files,
      ".planning/open-dough.json":
        typeof settings === "string" ? settings : intentSettingsText(settings),
      ...sources,
    },
  });
}
