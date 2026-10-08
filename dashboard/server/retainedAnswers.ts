// Answers the local authenticated read boundary's memo (`./revisionMemo.ts`)
// kept at resolved commits, retained on this machine for every dashboard
// process of this user: `~/.open-dough/dashboard/retained-answers/`, resolved
// through `HOME`, owner-only, one file per entry named by a digest of its key
// and holding that key and its text. Each file is replaced whole
// (`./fileReplacement.ts`), so concurrent processes never see a torn one; a
// file that is absent, unreadable, or holds another key is a miss. Deleting
// the directory loses nothing but requests. A directory that cannot be
// written is reported once and then left alone; reading goes on from GitHub.
// The store stays within a byte budget: a file's modification time is its
// last use, refreshed by every answer it gives, and a write that takes the
// store over the budget removes the least recently used files until it fits
// with room to spare. A file another process removes is simply a later miss.

import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
} from "node:fs";
import path from "node:path";
import { configuredLimit } from "./configuredLimit.ts";
import { replaceFile } from "./fileReplacement.ts";
import { machineDashboardPath } from "./machineHome.ts";

type Entry = { readonly key: string; readonly text: string };

// How many bytes of entry files the store holds at most: 64 MiB.
const retainedAnswersBytes = () =>
  configuredLimit("DOUGH_RETAINED_ANSWERS_BYTES", 64 * 1024 * 1024);

// Entry files only: a write still in flight (`./fileReplacement.ts`) is
// neither counted nor removed.
const isEntry = (name: string) => name.endsWith(".json");

const sizeOf = (entries: readonly { readonly size: number }[]) =>
  entries.reduce((sum, { size }) => sum + size, 0);

export class RetainedAnswers {
  private readonly directory = machineDashboardPath("retained-answers");
  private readonly budget = retainedAnswersBytes();
  private prepared = false;
  private unwritable = false;
  // The store's size as this process last counted it plus what it wrote
  // since; other processes' writes are counted at its next count. Counted
  // once by the first write and again only when this goes over the budget.
  private stored: number | undefined;

  private file(key: string): string {
    const digest = createHash("sha256").update(key).digest("hex");
    return path.join(this.directory, `${digest}.json`);
  }

  held(key: string): string | undefined {
    try {
      const entry = JSON.parse(
        readFileSync(this.file(key), "utf8"),
      ) as Partial<Entry> | null;
      if (entry?.key !== key || typeof entry.text !== "string") {
        return undefined;
      }
      this.used(key);
      return entry.text;
    } catch {
      return undefined;
    }
  }

  // Marks the entry under `key` as used now; one removed meanwhile stays
  // removed.
  private used(key: string): void {
    try {
      const now = new Date();
      utimesSync(this.file(key), now, now);
    } catch {
      /* A later write or miss decides its fate. */
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
      const written = JSON.stringify({ key, text });
      this.stored ??= sizeOf(this.counted());
      replaceFile(this.file(key), written, 0o600);
      // A file written over is counted again, which only counts sooner.
      this.stored += Buffer.byteLength(written);
      if (this.stored > this.budget) {
        this.stored = this.fitted();
      }
    } catch (error) {
      this.unwritable = true;
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `Retained GitHub answers could not be written to ${this.directory}; this dashboard reads from GitHub instead. ${reason}`,
      );
    }
  }

  // Every entry file with its size and last use; one removed while counted
  // is left out.
  private counted(): { file: string; size: number; used: number }[] {
    return readdirSync(this.directory)
      .filter(isEntry)
      .flatMap((name) => {
        const file = path.join(this.directory, name);
        try {
          const { size, mtimeMs } = statSync(file);
          return [{ file, size, used: mtimeMs }];
        } catch {
          return [];
        }
      });
  }

  // Removes the least recently used entries until the store holds at most
  // seven eighths of the budget, so the next writes need no count; answers
  // the size left.
  private fitted(): number {
    const entries = this.counted().sort((a, b) => a.used - b.used);
    let size = sizeOf(entries);
    const target = (this.budget * 7) / 8;
    for (const entry of entries) {
      if (size <= target) {
        break;
      }
      rmSync(entry.file, { force: true });
      size -= entry.size;
    }
    return size;
  }
}
