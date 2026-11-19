// Settles a mounted dashboard inside React's act: each action and every
// answer it starts settle before the case reads the page.
import { act } from "react";

// Resolves after the current task, so service answers and effects already
// started reach React. The fixture's timers fake neither message ports nor
// frames, so this wait and the next one pass in real time.
function nextTask() {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

// Resolves after the next frame and the task after it, so observer callbacks
// the frame runs reach React too.
function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      void nextTask().then(resolve);
    });
  });
}

// The rounds a mounted act waits for the page to settle before failing the case.
export const settleRounds = 20;

// A page still changing after `settleRounds` rounds, named so the case fails
// instead of reading a page React has not settled.
export class UnsettledPageError extends Error {
  override name = "UnsettledPageError";
  constructor() {
    super(`The page did not settle within ${settleRounds} rounds.`);
  }
}

// Runs `action` inside act and settles the page: task rounds while it still
// changes, then a frame round, so answers that later effects request and
// observer callbacks of the new layout also reach React inside act: for
// mounts, clock advances and output the page receives. It is settled when a
// frame round changes nothing; a page still changing after `settleRounds`
// rounds fails with `UnsettledPageError`.
export async function actSettled(action: () => unknown) {
  let changed = false;
  const changes = new MutationObserver(() => {
    changed = true;
  });
  changes.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  try {
    await act(async () => {
      await action();
      await nextTask();
    });
    // Whether the last round was a frame round.
    let final = false;
    for (let round = 0; round < settleRounds; round += 1) {
      if (changes.takeRecords().length > 0) changed = true;
      if (final && !changed) return;
      final = !changed;
      changed = false;
      await act(final ? nextFrame : nextTask);
    }
    throw new UnsettledPageError();
  } finally {
    changes.disconnect();
  }
}
