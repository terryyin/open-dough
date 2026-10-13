// Whether a part's words read whole: no word laid across lines, measured by
// asking the browser where each run of letters is drawn.

import type { Locator } from "@playwright/test";

// Runs of letters laid on more than one line: words a reader would have to
// put together again.
export const lettersBrokenApart = (part: Locator) =>
  part.evaluate((element) => {
    const broken: string[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const run of (node.textContent ?? "").matchAll(/\p{L}+/gu)) {
        const range = document.createRange();
        range.setStart(node, run.index);
        range.setEnd(node, run.index + run[0].length);
        const tops = new Set(
          [...range.getClientRects()].map((rect) => Math.round(rect.top)),
        );
        if (tops.size > 1) broken.push(run[0]);
      }
    }
    return broken;
  });
