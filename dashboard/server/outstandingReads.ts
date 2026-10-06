// The reads still outstanding at the local authenticated read boundary
// (`./authenticatedRead.ts`), one per key: requests for the same key while
// its read is outstanding share that one read, and the entry leaves once the
// read settles, so a failure is never kept and a later request asks again.
// Each read is bounded from its start; what a settled read's answer is kept
// for, if anything, belongs to the caller.
//
// A read is ended either by the boundary's tracked controllers (`read`), or
// by its waiters (`waitFor`): it ends once no request waits for it, and
// closing the boundary ends it by ending every request that waits.

// Why a read was aborted at its own bound, rather than because nobody waits
// or the boundary closed.
export class ReadBoundReached extends Error {
  constructor() {
    super("The read reached its own bound.");
  }
}

type Outstanding<T> = {
  readonly read: Promise<T>;
  readonly controller: AbortController;
  waiters: number;
};

export class OutstandingReads<T> {
  private readonly reading = new Map<string, Outstanding<T>>();

  // `boundMs` is how long one read may run from its start before it is
  // aborted with `ReadBoundReached`.
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
      return outstanding.read;
    }
    const { read, controller } = this.started(key, start);
    tracked.add(controller);
    void read
      .finally(() => {
        tracked.delete(controller);
      })
      .catch(() => undefined);
    return read;
  }

  // One request's wait for the read under `key`, joining the outstanding
  // one or else starting it. The wait settles with the read, or rejects with
  // `waiter`'s reason once `waiter` aborts; the read itself is aborted only
  // when its last waiter leaves.
  waitFor(
    key: string,
    waiter: AbortSignal,
    start: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    if (waiter.aborted) {
      return Promise.reject(waiter.reason as Error);
    }
    const outstanding = this.reading.get(key) ?? this.started(key, start);
    outstanding.waiters += 1;
    return new Promise<T>((resolve, reject) => {
      const leave = () => {
        outstanding.waiters -= 1;
        if (outstanding.waiters === 0) {
          this.ended(key, outstanding);
          outstanding.controller.abort();
        }
        reject(waiter.reason as Error);
      };
      waiter.addEventListener("abort", leave, { once: true });
      outstanding.read
        .finally(() => {
          waiter.removeEventListener("abort", leave);
        })
        .then(resolve, reject);
    });
  }

  private started(
    key: string,
    start: (signal: AbortSignal) => Promise<T>,
  ): Outstanding<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      this.ended(key, outstanding);
      controller.abort(new ReadBoundReached());
    }, this.boundMs);
    const outstanding: Outstanding<T> = {
      read: start(controller.signal).finally(() => {
        clearTimeout(timer);
        this.ended(key, outstanding);
      }),
      controller,
      waiters: 0,
    };
    this.reading.set(key, outstanding);
    return outstanding;
  }

  // A read being ended is no longer outstanding: a later request starts a
  // new one rather than joining it.
  private ended(key: string, outstanding: Outstanding<T>): void {
    if (this.reading.get(key) === outstanding) {
      this.reading.delete(key);
    }
  }
}
