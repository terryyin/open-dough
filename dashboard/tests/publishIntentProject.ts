import type { IntentSettings } from "../../Distribution/tests/support/intentLocationTestData.mjs";
import type { CatalogPublication } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedFiles.ts";
import { intentSettingsText } from "./support/intentSettingsFile.ts";

// `published` with `settings`, built through MakeMe or given as the exact
// settings text a case proves, and `sources` at its revision.
export function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: CatalogPublication,
  settings: IntentSettings | string,
  sources: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...published.files,
      ".planning/open-dough.json":
        typeof settings === "string" ? settings : intentSettingsText(settings),
      ...sources,
    },
  });
}
