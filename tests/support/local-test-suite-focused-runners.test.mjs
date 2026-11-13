// Each runner owning one group (dashboard/frontend.playwright.config.ts,
// dashboard/backend.playwright.config.ts, e2e/playwright.config.ts) takes the same repository admission
// as the umbrella when unfiltered, and only then: its focused runs, its
// listing and its own CI split stay independent, and the umbrella's split
// does not make its run focused.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fullDashboardSuite } from "../../dashboard/tests/support/fullSuiteSelection.mjs";
import {
  dashboard,
  fixture,
  repository,
  succeeded,
  until,
} from "./local-test-suite-fixtures.mjs";

const runners = [
  {
    name: "Dashboard Frontend Test",
    config: "controlled-frontend.config.mts",
    split: "OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT",
  },
  {
    name: "Dashboard Backend Test",
    config: "controlled-backend.config.mts",
    split: "OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT",
  },
  {
    name: "E2E Test",
    config: "controlled-e2e.config.mts",
    split: "OPEN_DOUGH_E2E_SPLIT",
  },
];

for (const runner of runners) {
  test(`an unfiltered ${runner.name} run holds repository admission while its focused and listing runs stay independent`, async (t) => {
    const { project, linked, observe } = await fixture(t);
    const first = observe("focused-runner"),
      second = observe("repository");
    const owner = dashboard(t, linked, first, [], {}, runner.config);
    await until(
      `${runner.name} started`,
      () =>
        existsSync(path.join(first, "start")) || owner.child.exitCode !== null,
    );
    assert.ok(existsSync(path.join(first, "start")), owner.output());
    const waiter = repository(t, project, second);
    const focus = observe("focus");
    writeFileSync(path.join(focus, "release"), "");
    await succeeded(
      dashboard(t, project, focus, ["-g", "needle"], {}, runner.config),
    );
    assert.ok(!existsSync(path.join(second, "start-0")));
    const listing = observe("list");
    await succeeded(
      dashboard(t, project, listing, ["--list"], {}, runner.config),
    );
    assert.ok(!existsSync(path.join(listing, "workers")));
    writeFileSync(path.join(first, "release"), "");
    await succeeded(owner);
    await until(`repository entered after ${runner.name}`, () =>
      existsSync(path.join(second, "start-0")),
    );
    writeFileSync(path.join(second, "release"), "");
    await succeeded(waiter);
  });

  test(`only the ${runner.name} run's own split makes an unfiltered run focused`, () => {
    assert.equal(
      fullDashboardSuite(["test"], { [runner.split]: "1/2" }, runner.split),
      false,
    );
    for (const other of [
      "OPEN_DOUGH_DASHBOARD_SPLIT",
      ...runners.map(({ split }) => split).filter((s) => s !== runner.split),
    ])
      assert.equal(
        fullDashboardSuite(["test"], { [other]: "1/2" }, runner.split),
        true,
      );
  });
}
