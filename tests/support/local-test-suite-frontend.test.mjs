// Dashboard Frontend Test (dashboard/frontend.playwright.config.ts) takes the
// same repository admission as the umbrella when unfiltered, and only then:
// its focused runs, its listing and its own CI split stay independent, and
// the umbrella's split does not make its run focused.
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

const frontend = "controlled-frontend.config.mts";
const frontendSplit = "OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT";

test("an unfiltered Dashboard Frontend Test run holds repository admission while its focused and listing runs stay independent", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const first = observe("frontend"),
    second = observe("repository");
  const owner = dashboard(t, linked, first, [], {}, frontend);
  await until(
    "frontend started",
    () =>
      existsSync(path.join(first, "start")) || owner.child.exitCode !== null,
  );
  assert.ok(existsSync(path.join(first, "start")), owner.output());
  const waiter = repository(t, project, second);
  const focus = observe("focus");
  writeFileSync(path.join(focus, "release"), "");
  await succeeded(dashboard(t, project, focus, ["-g", "needle"], {}, frontend));
  assert.ok(!existsSync(path.join(second, "start-0")));
  const listing = observe("list");
  await succeeded(dashboard(t, project, listing, ["--list"], {}, frontend));
  assert.ok(!existsSync(path.join(listing, "workers")));
  writeFileSync(path.join(first, "release"), "");
  await succeeded(owner);
  await until("repository entered after frontend", () =>
    existsSync(path.join(second, "start-0")),
  );
  writeFileSync(path.join(second, "release"), "");
  await succeeded(waiter);
});

test("only the frontend run's own split makes an unfiltered run focused", () => {
  assert.equal(
    fullDashboardSuite(["test"], { [frontendSplit]: "1/2" }, frontendSplit),
    false,
  );
  assert.equal(
    fullDashboardSuite(
      ["test"],
      { OPEN_DOUGH_DASHBOARD_SPLIT: "1/2" },
      frontendSplit,
    ),
    true,
  );
});
