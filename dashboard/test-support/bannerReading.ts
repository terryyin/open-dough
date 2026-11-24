import { expect, type Locator } from "@playwright/test";
import { box, expectSideBySideInOrder } from "./partArrangement.ts";

// The controls, given in their expected order, lie side by side on the
// banner's one row, each centred on the same line.
export async function expectBannerRow(inOrder: Locator[]) {
  await expectSideBySideInOrder(inOrder);
  const middles = (await Promise.all(inOrder.map(box))).map(
    ({ y, height }) => y + height / 2,
  );
  for (const middle of middles) expect(middle).toBeCloseTo(middles[0] ?? 0, 0);
}
