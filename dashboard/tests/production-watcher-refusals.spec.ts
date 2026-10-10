// The public watcher refuses unusable options and origins before preparing or
// serving any production dashboard.
import { expect, test } from "./support/pageTest.ts";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";

// The fixture commits this repository's whole source (about 2s alone, about
// 20s while other workers commit theirs, most of it in `git add`), and the
// four commands follow it; give it its own budget, as the other full-source
// production specs have, so a busy machine cannot starve it inside the
// default per-test timeout.
test("npm watcher refuses invalid options and an origin without published main", async () => {
  test.setTimeout(120_000);
  const fixture = await publishedMainFixture(true);
  try {
    for (const [args, reason] of [
      [["--port", "43127"], "distinct from development's 43127"],
      [["--port", "65536"], "Production port must be 0–65535"],
      [["--check-interval", "0"], "Check interval must be a positive number"],
    ] as const) {
      const invalid = dashboardCommand(
        fixture.development,
        fixture.env,
        "watch:dashboard",
        [...args],
      );
      expect((await invalid.exited).code).toBe(1);
      expect(invalid.output()).toContain(reason);
      expect(invalid.output()).not.toContain("Preparing production dashboard");
    }
    const watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
    );
    expect((await watcher.exited).code).toBe(1);
    expect(watcher.output()).toContain("Production dashboard could not run");
    expect(watcher.output()).toContain("has no published main branch");
    expect(watcher.output()).not.toContain("at http://");
  } finally {
    fixture.cleanup();
  }
});
