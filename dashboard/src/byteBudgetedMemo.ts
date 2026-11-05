// Values kept in memory for one browser session within a byte budget, least
// recently used first out, shared by the file text cache
// (`./fileContentCache.ts`) and the answer memo (`./answerMemo.ts`). Each hit
// refreshes its entry; a write that takes the memo over its budget removes
// the least recently used entries until it fits. A single value larger than
// the budget stays, so its reader can still reuse it; further writes then
// push it out. No persistence.

export type ByteBudgetedMemo<Value> = {
  readonly get: (key: string) => Value | undefined;
  readonly set: (key: string, value: Value) => void;
  readonly retainedBytes: () => number;
  readonly clear: () => void;
};

export function byteBudgetedMemo<Value>(
  budgetBytes: number,
  bytesOf: (value: Value) => number,
): ByteBudgetedMemo<Value> {
  type Entry = { readonly value: Value; readonly bytes: number };
  // Map iteration order is insertion order, so the first key is the least
  // recently used.
  const entries = new Map<string, Entry>();
  let retained = 0;

  function forget(key: string, entry: Entry): void {
    entries.delete(key);
    retained -= entry.bytes;
  }

  return {
    get(key) {
      const entry = entries.get(key);
      if (entry === undefined) return undefined;
      entries.delete(key);
      entries.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      const prior = entries.get(key);
      if (prior !== undefined) forget(key, prior);
      const entry = { value, bytes: bytesOf(value) };
      entries.set(key, entry);
      retained += entry.bytes;
      while (retained > budgetBytes && entries.size > 1) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        const evicted = entries.get(oldest);
        if (evicted === undefined) break;
        forget(oldest, evicted);
      }
    },
    retainedBytes: () => retained,
    clear() {
      entries.clear();
      retained = 0;
    },
  };
}
