// One kind of observation shared by every demand on this server. At most one
// runs at a time, until it settles, whatever its waiters do: a waiter that
// leaves or waits past its bound never ends it for the others, and no second
// one starts while it runs. Its settled result serves later demand for a short
// reuse window; a failed one keeps no result, so the next demand starts afresh.
// Each demand names the inputs it must be observed under (`key`): a running or
// settled observation under other inputs never answers it, and a demand that
// finds one running waits for it to settle before starting its own; the
// observation is made under those inputs.

export type Demanded<T> =
  | { readonly kind: "observed"; readonly value: T }
  // Not settled within the waiter's bound; asking again may be answered.
  | { readonly kind: "unanswered" }
  // The waiter's own signal ended its wait.
  | { readonly kind: "departed" };

type Key = readonly unknown[];

type Running<T, K extends Key> = {
  readonly key: K;
  readonly result: Promise<T>;
};

type Settled<T, K extends Key> = {
  readonly key: K;
  readonly at: number;
  readonly value: T;
};

function sameKey(a: Key, b: Key): boolean {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

// Whether `result` settled (either way) before `deadline` or `signal`.
function waited(
  result: Promise<unknown>,
  deadline: number,
  signal: AbortSignal,
): Promise<"settled" | "unanswered" | "departed"> {
  if (signal.aborted) return Promise.resolve("departed");
  return new Promise((resolve) => {
    const departed = () => {
      end("departed");
    };
    const timer = setTimeout(
      () => {
        end("unanswered");
      },
      Math.max(0, deadline - Date.now()),
    );
    function end(outcome: "settled" | "unanswered" | "departed") {
      clearTimeout(timer);
      signal.removeEventListener("abort", departed);
      resolve(outcome);
    }
    signal.addEventListener("abort", departed, { once: true });
    void result.then(
      () => {
        end("settled");
      },
      () => {
        end("settled");
      },
    );
  });
}

export class SharedObservation<T, K extends Key = Key> {
  private running: Running<T, K> | undefined;
  private settled: Settled<T, K> | undefined;

  constructor(
    private readonly observe: (key: K) => Promise<T>,
    // How long a settled result serves later demand, read on each demand.
    private readonly reuseMs: () => number,
  ) {}

  // The observation under `key`: a settled one within the reuse window, the
  // running one, or a new one once none runs. Waits at most `waitMs` and
  // until `signal` ends. A failed observation rejects its own waiters.
  async demand(
    key: K,
    waitMs: number,
    signal: AbortSignal,
  ): Promise<Demanded<T>> {
    const deadline = Date.now() + waitMs;
    for (;;) {
      const { settled } = this;
      if (
        settled !== undefined &&
        sameKey(settled.key, key) &&
        Date.now() - settled.at < this.reuseMs()
      )
        return { kind: "observed", value: settled.value };
      const running = this.running ?? this.start(key);
      const outcome = await waited(running.result, deadline, signal);
      if (outcome !== "settled") return { kind: outcome };
      if (sameKey(running.key, key))
        return { kind: "observed", value: await running.result };
    }
  }

  private start(key: K): Running<T, K> {
    const result = (async () => this.observe(key))();
    const running = { key, result };
    this.running = running;
    this.settled = undefined;
    // Registered before any waiter's, so a woken waiter finds it ended.
    void result.then(
      (value) => {
        if (this.running !== running) return;
        this.running = undefined;
        this.settled = { key, at: Date.now(), value };
      },
      () => {
        if (this.running === running) this.running = undefined;
      },
    );
    return running;
  }
}
