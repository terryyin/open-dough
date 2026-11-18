// Whether a part's words read whole: no word laid across lines, measured by
// asking the browser where each run of text is drawn.

import type { Locator } from "@playwright/test";

// Runs matching `runs` laid on more than one line, in the part or, given
// `within`, in each of its descendants that selector matches.
const runsBrokenApart = (part: Locator, runs: string, within?: string) =>
  part.evaluate(
    (element, { runs, within }) => {
      const broken: string[] = [];
      const parts =
        within === undefined ? [element] : element.querySelectorAll(within);
      for (const each of parts) {
        const walker = document.createTreeWalker(each, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          for (const run of (node.textContent ?? "").matchAll(
            new RegExp(runs, "gu"),
          )) {
            const range = document.createRange();
            range.setStart(node, run.index);
            range.setEnd(node, run.index + run[0].length);
            const tops = new Set(
              [...range.getClientRects()].map((rect) => Math.round(rect.top)),
            );
            if (tops.size > 1) broken.push(run[0]);
          }
        }
      }
      return broken;
    },
    { runs, within },
  );

// Runs of letters laid on more than one line: words a reader would have to
// put together again.
export const lettersBrokenApart = (part: Locator) =>
  runsBrokenApart(part, "\\p{L}+");

// Words between spaces laid on more than one line, in each of the part's
// descendants that `within` selects: tokens such as a short commit or a
// duration, which a break between any two characters splits.
export const wordsBrokenApart = (part: Locator, within: string) =>
  runsBrokenApart(part, "\\S+", within);
