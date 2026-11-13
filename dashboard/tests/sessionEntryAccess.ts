// A Session entry's access control opens its Terminal or retained Final report:
// its main access, shown without any disclosure, on a card, in a column or in
// Recently done. Each is matched by its exact name. Locating it adds no input,
// focus transfer, disclosure or answer wait.
import type { Locator } from "@playwright/test";

// The access control a caller names, such as either access a Recently done
// row may offer.
export function sessionEntryAccessControl(
  entry: Locator,
  { name }: { name: string | RegExp },
) {
  return entry.getByRole("button", { name, exact: true });
}

export const openTerminalControl = (entry: Locator) =>
  sessionEntryAccessControl(entry, { name: "Open terminal" });

export const readFinalReportControl = (entry: Locator) =>
  sessionEntryAccessControl(entry, { name: "Read final report" });
