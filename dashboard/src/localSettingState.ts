// One subscribed view of a machine-local setting. Readers share periodic reads
// and change answers; an older answer never replaces a newer one.
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export function localSettingState<Answer, Change>(
  request: (change?: Change) => Promise<Answer>,
) {
  let answer: Answer | undefined;
  let issued = 0;
  let shown = 0;
  let generation = 0;
  let interval: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  const answered = async (asked: Promise<Answer>) => {
    const sequence = ++issued;
    const from = generation;
    const received = await asked;
    if (from !== generation || sequence <= shown) return;
    shown = sequence;
    answer = received;
    for (const listener of listeners) listener();
  };
  const read = () => {
    void answered(request()).catch(() => undefined);
  };
  return {
    snapshot: () => answer,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        read();
        interval = setInterval(read, checkIntervalMs);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size !== 0) return;
        clearInterval(interval);
        generation += 1;
        answer = undefined;
      };
    },
    change: (change: Change) => answered(request(change)),
  };
}
