// A bounded in-process map by key: past `limit` the oldest entry is
// forgotten, far more than one dashboard shows. Disposable derived CI
// answers (proof summaries, kept CI status) share this under ADR 0008.

export type RememberedByKey<T> = {
  readonly get: (key: string) => T | undefined;
  readonly set: (key: string, value: T) => void;
  // Replace and treat as newest so a refreshed key is not forgotten next.
  readonly replace: (key: string, value: T) => void;
  readonly clear: () => void;
};

export function rememberedByKey<T>(limit = 256): RememberedByKey<T> {
  const entries = new Map<string, T>();
  const trim = () => {
    const [oldest] = entries.keys();
    if (entries.size > limit && oldest !== undefined) entries.delete(oldest);
  };
  return {
    get(key) {
      return entries.get(key);
    },
    set(key, value) {
      entries.set(key, value);
      trim();
    },
    replace(key, value) {
      entries.delete(key);
      entries.set(key, value);
      trim();
    },
    clear() {
      entries.clear();
    },
  };
}
