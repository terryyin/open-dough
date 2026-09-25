import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: 0,
  // A passing run prints nothing; a failure, or output from a passing test
  // or from the run itself, fails the run and is shown
  // (tests/support/quietReporter.ts). CI also keeps an HTML report, which
  // writes files only.
  reporter: process.env["CI"]
    ? [
        ["./tests/support/quietReporter.ts"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [["./tests/support/quietReporter.ts"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Every run builds the production app once; each page journey then serves
  // that build from its own preview server, whose `gh` is a synthetic one
  // answering from that test's own fake GitHub (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
