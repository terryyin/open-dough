// The files a usage Refresh (./usageRefresh.ts) reads of one host: Codex
// rollouts by the thread that contains them (./codexUsageLineage.ts), Claude
// transcripts by their session (./claudeUsageKeys.ts).
import { stat } from "node:fs/promises";
import { nativeUsageFiles } from "./nativeUsageFiles.ts";
import type { UsageGap } from "./usageRecords.ts";

// Every file under the roots by the session that contains it, and every file
// of each session one of whose files was modified at or after `cutoff`: a
// session is read from all its files, so the contribution that replaces its
// stored one is whole.
export async function changedSessions(
  roots: readonly string[],
  containing: (file: string) => string,
  cutoff: number,
  gaps: UsageGap[],
) {
  const modified = new Set<string>();
  const sessions = new Map<string, string[]>();
  for (const root of roots)
    for await (const file of nativeUsageFiles(root, gaps)) {
      const session = containing(file);
      sessions.set(session, [...(sessions.get(session) ?? []), file]);
      try {
        if ((await stat(file)).mtimeMs >= cutoff) modified.add(session);
      } catch {
        /* A file removed while listing has nothing left to read. */
      }
    }
  const changed = [...modified].flatMap((id) => sessions.get(id) ?? []);
  return { changed, sessions };
}
