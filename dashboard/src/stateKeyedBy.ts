// React state held for one key: a changed key drops it, so the state opens
// on its initial value again, as on first render. `keyed` is false for the
// render that sees the new key, which React repeats with the dropped state.

import { useState } from "react";

export function useStateKeyedBy<T>(initial: T, keyedBy: string | undefined) {
  const [held, setHeld] = useState({ value: initial, keyedBy });
  const keyed = held.keyedBy === keyedBy;
  if (!keyed) setHeld({ value: initial, keyedBy });
  return {
    value: keyed ? held.value : initial,
    keyed,
    set: (value: T) => {
      setHeld({ value, keyedBy });
    },
  };
}
