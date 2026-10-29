// A session entry's two independent disclosures. Scope may also be a panel
// or an already-open question, whose existing direct controls need no disclosure.
import type { Locator } from "@playwright/test";

async function disclose(scope: Locator, name: string): Promise<Locator> {
  await scope.waitFor({ state: "attached" });
  const control = scope.getByRole("button", { name, exact: true });
  if (
    (await control.count()) === 1 &&
    (await control.getAttribute("aria-expanded")) === "false"
  ) {
    // Keyboard focus also reveals a paged-out Board column before its control
    // is pressed, as the dashboard's normal cross-column keyboard route does.
    await control.focus();
    await control.click();
  }
  return scope;
}

export const sessionActions = (scope: Locator) =>
  disclose(scope, "More session actions");
export const sessionDetails = (scope: Locator) =>
  disclose(scope, "Session details");

// The named lifecycle control after its entry disclosure is opened. A panel or
// in-place question already offering the control follows the same route.
export async function sessionAction(
  scope: Locator,
  name: string,
): Promise<Locator> {
  return (await sessionActions(scope)).getByRole("button", {
    name,
    exact: true,
  });
}
