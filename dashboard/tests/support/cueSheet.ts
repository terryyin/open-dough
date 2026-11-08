// One phase of a journey as a cue sheet: fluent page objects
// (../sidePanelPages.ts) write the phase's named cues, the test's own
// actions and observations, in order and without touching the page; the
// phase then runs them, each as its own Playwright step, and stops at the
// first that fails, keeping that step's assertion. The page's requests and
// the native hosts move on their own, so what a phase waits for is always
// something the page shows; holds, request counts and kept records stay
// with the test between phases.

import { test } from "./pageTest.ts";

type Location = { file: string; line: number; column: number };

// Where the spec wrote the cue now being written: the first spec frame of
// the stack, as the source map gives it.
function specLine(): Location | undefined {
  for (const frame of new Error().stack?.split("\n") ?? []) {
    const at = /\(?([^()\s]+\.spec\.ts):(\d+):(\d+)\)?$/.exec(frame);
    if (at?.[1] !== undefined)
      return { file: at[1], line: Number(at[2]), column: Number(at[3]) };
  }
  return undefined;
}

// The cues one phase runs, in the order they were written.
export class CueSheet {
  readonly #cues: {
    readonly name: string;
    readonly run: () => Promise<void>;
    readonly location: Location | undefined;
  }[] = [];

  // Writes a named cue; it runs only when the phase plays the sheet. Its
  // step is located at the spec line that wrote it.
  cue(name: string, run: () => Promise<void>) {
    this.#cues.push({ name, run, location: specLine() });
  }

  async play() {
    for (const { name, run, location } of this.#cues)
      await test.step(name, run, location === undefined ? {} : { location });
  }
}

// Runs one phase, named `title`: `write` writes its cues synchronously on the
// page objects it is given, and the phase plays them in that order.
export async function phase<Pages>(
  title: string,
  pages: (cues: CueSheet) => Pages,
  write: (pages: Pages) => unknown,
) {
  const location = specLine();
  await test.step(
    title,
    async () => {
      const cues = new CueSheet();
      if (write(pages(cues)) instanceof Promise)
        throw new Error(
          `Phase "${title}" wrote its cues asynchronously; write them synchronously.`,
        );
      await cues.play();
    },
    location === undefined ? {} : { location },
  );
}
