import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { dashboardDeveloper } from "./startOriginPreparation.ts";

// Commits `file` in the checkout at `at`, holding `content` when given, and
// answers the commit.
export function commitAt(
  checkout: string,
  at: string,
  file: string,
  content = `${file} at ${at}\n`,
): Promise<string> {
  return commitDeclaredRevision(checkout, {
    message: `Add ${file}`,
    files: { [file]: content },
    committer: { ...dashboardDeveloper, date: at },
  });
}
