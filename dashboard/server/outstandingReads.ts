// The reads still outstanding at the local authenticated read boundary
// (`./authenticatedRead.ts`), one per key: requests for the same key while
// its read is outstanding share that one read, and the entry leaves once the
// read settles, so a failure is never kept and a later request asks again.
// Each read is bounded from its start and tracked so closing the boundary
// ends it. What a settled read's answer is kept for, if anything, belongs to
// the caller.

export class OutstandingReads<T> {
  private readonly reading = new Map<string, Promise<T>>();

  // `boundMs` is how long one read may run from its start before it is
  // aborted.
  constructor(private readonly boundMs: number) {}

  // The outstanding read for `key`, or else a new one that `start` begins
  // with a signal aborted at the bound or when the boundary closes;
  // `tracked` is the boundary's set of controllers it aborts on closing.
  read(
    key: string,
    tracked: Set<AbortController>,
    start: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const outstanding = this.reading.get(key);
    if (outstanding !== undefined) {
      return outstanding;
    }
    const controller = new AbortController();
    tracked.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
    }, this.boundMs);
    const read = start(controller.signal).finally(() => {
      clearTimeout(timer);
      tracked.delete(controller);
      this.reading.delete(key);
    });
    this.reading.set(key, read);
    return read;
  }
}
