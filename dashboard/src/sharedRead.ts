// One request for every reader that asks the same question at once, for the
// browser session (`./fileContentCache.ts`, `./answerMemo.ts`): a read
// already in flight under a key is joined instead of asked again. Each
// reader keeps its own departure: its signal ending stops only its own wait,
// while the shared read continues for anyone still waiting, and is ended
// once nobody waits. A settled read is forgotten here at once, so a failure
// is asked again by the next reader.

type InFlight = {
  readonly answer: Promise<unknown>;
  readonly controller: AbortController;
  waiting: number;
};

const inFlight = new Map<string, InFlight>();

function departed(signal: AbortSignal): Error {
  const reason: unknown = signal.reason;
  return reason instanceof Error
    ? reason
    : new DOMException("Aborted", "AbortError");
}

// The answer to `key`, asked with `ask` unless that read is already in
// flight. `signal` is this reader's departure.
export function joinRead<T>(
  key: string,
  ask: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) return Promise.reject(departed(signal));
  let shared = inFlight.get(key);
  if (shared === undefined) {
    const controller = new AbortController();
    const started: InFlight = {
      answer: ask(controller.signal),
      controller,
      waiting: 0,
    };
    const settle = () => {
      if (inFlight.get(key) === started) inFlight.delete(key);
    };
    started.answer.then(settle, settle);
    inFlight.set(key, started);
    shared = started;
  }
  const read = shared;
  read.waiting += 1;
  return new Promise<T>((resolve, reject) => {
    let waiting = true;
    const stopWaiting = () => {
      waiting = false;
      read.waiting -= 1;
      signal.removeEventListener("abort", depart);
    };
    function depart() {
      if (!waiting) return;
      stopWaiting();
      reject(departed(signal));
      // A reader leaving and another arriving in the same turn (a remount)
      // keeps the read; it ends only when nobody waits after this turn.
      queueMicrotask(() => {
        if (read.waiting === 0 && inFlight.get(key) === read) {
          inFlight.delete(key);
          read.controller.abort();
        }
      });
    }
    signal.addEventListener("abort", depart, { once: true });
    read.answer.then(
      (answer) => {
        if (!waiting) return;
        stopWaiting();
        resolve(answer as T);
      },
      (error: unknown) => {
        if (!waiting) return;
        stopWaiting();
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
