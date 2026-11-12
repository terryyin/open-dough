// A Session entry's access control opens its Terminal or retained Final report.
// Locating it adds no input, focus transfer, disclosure or answer wait.
import type { Locator } from "@playwright/test";

export function sessionEntryAccessControl(
  entry: Locator,
  { name, exact = false }: { name: string | RegExp; exact?: boolean },
) {
  return entry.getByRole("button", { name, exact });
}

export function openTerminalControl(
  entry: Locator,
  {
    name = "Open terminal",
    exact = true,
  }: {
    name?: string | RegExp;
    exact?: boolean;
  } = {},
) {
  return sessionEntryAccessControl(entry, { name, exact });
}

export function readFinalReportControl(
  entry: Locator,
  { exact = false }: { exact?: boolean } = {},
) {
  return sessionEntryAccessControl(entry, { name: "Read final report", exact });
}
