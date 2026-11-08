// Advance selected timeouts inside an HTTP request without moving process,
// HTTP, or test-runner timers outside that request.
import { AsyncLocalStorage } from "node:async_hooks";
import { EventEmitter, once } from "node:events";
import { mock } from "node:test";

export function controlRequestTimers(...delays: number[]) {
  const request = new AsyncLocalStorage<boolean>();
  const armed = new EventEmitter();
  const pending = new Map<unknown, { due: number; run: () => void }>();
  let now = 0;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const set = mock.method(
    globalThis,
    "setTimeout",
    (
      callback: (...args: unknown[]) => void,
      delay?: number,
      ...args: unknown[]
    ) => {
      if (
        !request.getStore() ||
        delay === undefined ||
        !delays.includes(delay)
      ) {
        return realSetTimeout(callback, delay, ...args);
      }
      const handle = {} as ReturnType<typeof setTimeout>;
      pending.set(handle, {
        due: now + delay,
        run: AsyncLocalStorage.bind(() => {
          callback(...args);
        }),
      });
      armed.emit("armed");
      return handle;
    },
  );
  const clear = mock.method(
    globalThis,
    "clearTimeout",
    (handle?: Parameters<typeof clearTimeout>[0]) => {
      if (!pending.delete(handle)) realClearTimeout(handle);
    },
  );

  return {
    inRequest: (handle: () => void) => {
      request.run(true, handle);
    },
    waitForTimer: async () => {
      if (pending.size === 0) await once(armed, "armed");
    },
    pendingTimers: () => pending.size,
    advance: (ms: number) => {
      now += ms;
      let fired = 0;
      for (const [handle, timer] of pending) {
        if (timer.due > now) continue;
        pending.delete(handle);
        fired += 1;
        timer.run();
      }
      return fired;
    },
    restore() {
      clear.mock.restore();
      set.mock.restore();
    },
  };
}
