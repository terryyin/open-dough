// A scoped `process.env` mutation for a test that must point an in-process
// invocation (rather than a spawned child, which instead gets its own env
// object) at a fixture, such as a fake `gh` on PATH. Restores exactly what
// it changed, including keys that were previously unset.

export function withRestoredEnv(
  overrides: Readonly<Record<string, string>>,
): () => void {
  const originals = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(overrides)) {
    originals.set(key, process.env[key]);
    process.env[key] = value;
  }
  return () => {
    for (const [key, original] of originals) {
      if (original === undefined) {
        Reflect.deleteProperty(process.env, key);
      } else {
        process.env[key] = original;
      }
    }
  };
}
