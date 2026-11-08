import type { CatalogPublication } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedFiles.ts";

export function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: CatalogPublication,
  settings: string,
  sources: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...published.files,
      ".planning/open-dough.json": `${settings}\n`,
      ...sources,
    },
  });
}
