// Values kept by key as React state: each set, or removed when set to
// undefined, without disturbing the others, and all cleared at once.

import { useCallback, useState } from "react";

export function useKeyedState<T>(): {
  readonly values: ReadonlyMap<string, T>;
  readonly set: (key: string, value: T | undefined) => void;
  readonly clear: () => void;
} {
  const [values, setValues] = useState<ReadonlyMap<string, T>>(new Map());
  const set = useCallback((key: string, value: T | undefined) => {
    setValues((now) => {
      const next = new Map(now);
      if (value === undefined) next.delete(key);
      else next.set(key, value);
      return next;
    });
  }, []);
  const clear = useCallback(() => {
    setValues(new Map());
  }, []);
  return { values, set, clear };
}
