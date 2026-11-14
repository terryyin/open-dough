// A close requested during private setup owns the resources that setup
// creates later, before any first activation is required or supplied.
import { existsSync } from "node:fs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { ProductionWatcherMachine } from "../../../e2e/runtime/productionWatcherMachine.ts";
import { processRunning } from "../../tests/support/processGroup.ts";

test("closing a watcher machine during setup retires its late resources", async ({
  browser,
  publishedApplicationSourceReady,
}) => {
  await Promise.resolve(publishedApplicationSourceReady);
  const machine = new ProductionWatcherMachine();
  try {
    const starting = machine.start(browser);
    const closing = machine.close();
    await Promise.all([starting, closing]);
    const { fixture, productionPage, developmentPage } = machine.started();
    const watcher = machine.running();
    expect(watcher.child.pid).toBeGreaterThan(0);
    expect(processRunning(watcher.child.pid ?? 0)).toBe(false);
    expect(existsSync(fixture.root)).toBe(false);
    expect(productionPage.isClosed()).toBe(true);
    expect(developmentPage.isClosed()).toBe(true);
  } finally {
    await machine.close();
  }
});
