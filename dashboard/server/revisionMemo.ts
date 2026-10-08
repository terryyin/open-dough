// The bounded store behind the local authenticated read boundary's memo of
// answers at resolved commits (`./pinnedMemo.ts`): in memory, per launched
// server, holding at most `memoLimit` texts and letting the oldest kept go
// first, and retained for every dashboard process on this machine
// (`./retainedAnswers.ts`), which answers what memory does not hold only when
// the caller says the read may use it (`retained`). What it answers is never
// held in memory, where a read that may not use it would find it. Failures
// are never kept.

import type { RetainedAnswers } from "./retainedAnswers.ts";

const memoLimit = 500;

export class RevisionMemo {
  private readonly texts = new Map<string, string>();

  constructor(private readonly retained: RetainedAnswers) {}

  held(key: string, retained: boolean): string | undefined {
    const known = this.texts.get(key);
    return known !== undefined || !retained ? known : this.retained.held(key);
  }

  kept(key: string, text: string): void {
    this.texts.set(key, text);
    while (this.texts.size > memoLimit) {
      const oldest = this.texts.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      this.texts.delete(oldest);
    }
    this.retained.kept(key, text);
  }

  // Keeps `text` under `key` as the newest kept, whatever it replaces.
  keptAnew(key: string, text: string): void {
    this.texts.delete(key);
    this.kept(key, text);
  }

  // What is kept under `key`, or else what `read` answers, then kept there.
  async recalled(
    key: string,
    retained: boolean,
    read: () => Promise<string>,
  ): Promise<string> {
    const known = this.held(key, retained);
    if (known !== undefined) {
      return known;
    }
    const text = await read();
    this.kept(key, text);
    return text;
  }
}

// What `recall` answers when it keeps the JSON text of what `read` answers.
export async function recalledAsJson<T>(
  recall: (read: () => Promise<string>) => Promise<string>,
  read: () => Promise<T>,
): Promise<T> {
  return JSON.parse(
    await recall(async () => JSON.stringify(await read())),
  ) as T;
}
