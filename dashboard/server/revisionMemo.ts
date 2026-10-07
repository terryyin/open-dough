// The bounded store behind the local authenticated read boundary's memo of
// answers at resolved commits (`./pinnedTexts.ts`): in memory, per launched
// server, holding at most `memoLimit` texts and letting the oldest kept go
// first. Failures are never kept.

const memoLimit = 500;

export class RevisionMemo {
  private readonly texts = new Map<string, string>();

  held(key: string): string | undefined {
    return this.texts.get(key);
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
  }

  // Keeps `text` under `key` as the newest kept, whatever it replaces.
  keptAnew(key: string, text: string): void {
    this.texts.delete(key);
    this.kept(key, text);
  }

  // What is kept under `key`, or else what `read` answers, then kept there.
  async recalled(key: string, read: () => Promise<string>): Promise<string> {
    const known = this.texts.get(key);
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
