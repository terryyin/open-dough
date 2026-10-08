// Answers the local authenticated read boundary's memo (`./revisionMemo.ts`)
// kept at resolved commits, retained on this machine for every dashboard
// process of this user: `~/.open-dough/dashboard/retained-answers/`, resolved
// through `HOME`, owner-only, one file per entry named by a digest of its key
// and holding that key and its text. Each file is replaced whole
// (`./fileReplacement.ts`), so concurrent processes never see a torn one; a
// file that is absent, unreadable, or holds another key is a miss. Deleting
// the directory loses nothing but requests. A directory that cannot be
// written is reported once and then left alone; reading goes on from GitHub.

import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { replaceFile } from "./fileReplacement.ts";
import { machineDashboardPath } from "./machineHome.ts";

type Entry = { readonly key: string; readonly text: string };

export class RetainedAnswers {
  private readonly directory = machineDashboardPath("retained-answers");
  private prepared = false;
  private unwritable = false;

  private file(key: string): string {
    const digest = createHash("sha256").update(key).digest("hex");
    return path.join(this.directory, `${digest}.json`);
  }

  held(key: string): string | undefined {
    try {
      const entry = JSON.parse(
        readFileSync(this.file(key), "utf8"),
      ) as Partial<Entry> | null;
      return entry?.key === key && typeof entry.text === "string"
        ? entry.text
        : undefined;
    } catch {
      return undefined;
    }
  }

  kept(key: string, text: string): void {
    if (this.unwritable) {
      return;
    }
    try {
      // Recreated whenever it was removed; tightened once per process.
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
      if (!this.prepared) {
        chmodSync(this.directory, 0o700);
        this.prepared = true;
      }
      replaceFile(this.file(key), JSON.stringify({ key, text }), 0o600);
    } catch (error) {
      this.unwritable = true;
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `Retained GitHub answers could not be written to ${this.directory}; this dashboard reads from GitHub instead. ${reason}`,
      );
    }
  }
}
