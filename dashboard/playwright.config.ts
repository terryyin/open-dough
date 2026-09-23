import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: 0,
  reporter: process.env["CI"]
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Every run builds the production app once; each page journey then serves
  // that build from its own preview server, whose `gh` is a synthetic one
  // answering from that test's own fake GitHub (tests/dashboardTest.ts).
  globalSetup: "./tests/support/globalSetup.ts",
});
