// The resources a serial file's beforeAll starts, released by its afterAll in
// the reverse order. A beforeAll that exceeds its timeout keeps running while
// Playwright runs afterAll, so a step reached after the release stops instead
// of writing into directories already removed, and a resource it still started
// is released at once rather than outliving the run.
export function serialFileResources() {
  let released = false;
  const releases: (() => Promise<unknown>)[] = [];
  function ensureOpen() {
    if (released)
      throw new Error(
        "The file's resources were released before its setup finished",
      );
  }
  return {
    ensureOpen,
    async acquire<T>(
      start: () => T | Promise<T>,
      release: (resource: T) => Promise<unknown>,
    ): Promise<T> {
      ensureOpen();
      const resource = await start();
      if (released) await release(resource);
      ensureOpen();
      releases.unshift(() => release(resource));
      return resource;
    },
    // Releases every resource, keeping each failure while still releasing the rest.
    async release() {
      released = true;
      const errors: unknown[] = [];
      for (const release of releases.splice(0)) {
        try {
          await release();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length === 1) throw errors[0];
      if (errors.length > 1)
        throw new AggregateError(
          errors,
          "Could not release the file's resources",
        );
    },
  };
}
