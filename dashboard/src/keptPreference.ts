// A view preference this browser keeps in its disposable storage, by key. The
// browser may keep nothing or refuse storage: reading then finds nothing, and
// keeping does nothing, so the preference lasts only for the page.

export function readKept(key: string, formerKey?: string): string | undefined {
  try {
    const current = window.localStorage.getItem(key);
    if (current !== null) return current;
    const former =
      formerKey === undefined ? null : window.localStorage.getItem(formerKey);
    if (former !== null) keep(key, former);
    return former ?? undefined;
  } catch {
    return undefined;
  }
}

export function keep(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Unkept, the preference lasts only for this page.
  }
}
