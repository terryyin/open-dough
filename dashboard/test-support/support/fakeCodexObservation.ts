// Passive metadata/history replies and held reads in the native protocol fixture.
import type { FakeCodexObservation } from "./fakeCodexTypes.ts";

export function passiveCodexFixture() {
  const observations = new Map<string, FakeCodexObservation>();
  const waitingReads: Array<() => void> = [];
  return {
    observations,
    releaseReads() {
      for (const done of waitingReads.splice(0)) done();
    },
    answer(
      method: string,
      params: Record<string, unknown>,
      fallbackTurns: readonly unknown[],
      reply: (value: unknown) => void,
      refuse: (error: unknown) => void,
    ): boolean {
      const threadId = String(params["threadId"]);
      const observation = observations.get(threadId);
      if (
        method === "thread/read" &&
        params["includeTurns"] === false &&
        observation !== undefined
      ) {
        const read = () => {
          if (observation.metadataError !== undefined)
            refuse(observation.metadataError);
          else reply({ thread: { id: threadId, status: observation.status } });
        };
        if (observation.holdRead === true) waitingReads.push(read);
        else read();
        return true;
      }
      if (method === "thread/turns/list") {
        if (observation?.historyError !== undefined)
          refuse(observation.historyError);
        else
          reply({
            data: (observation?.turns ?? fallbackTurns).slice(-1).reverse(),
            nextCursor: null,
          });
        return true;
      }
      return false;
    },
  };
}
