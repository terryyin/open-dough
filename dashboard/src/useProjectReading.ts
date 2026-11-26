// Project Intent's whole-project reading: its chosen view with the project
// tree at the shown revision. Story pages have none, so their browser follows
// the locations alone.

import type { ModeChoice } from "./pageIntentMode.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { useProjectTreeRead, type ProjectTree } from "./useProjectTreeRead.tsx";

export type ProjectReading = ModeChoice & { readonly tree: ProjectTree };

export function useProjectReading(
  source: PublishedSource,
  revision: string | undefined,
  // Project Intent's view choice, undefined on story pages.
  choice: ModeChoice | undefined,
): ProjectReading | undefined {
  const tree = useProjectTreeRead(
    source,
    choice === undefined ? undefined : revision,
  );
  return choice === undefined ? undefined : { ...choice, tree };
}
