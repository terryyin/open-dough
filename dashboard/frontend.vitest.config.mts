import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { mountedDashboardCommands } from "./test-support/support/mountedDashboardCommands.ts";
import { mountedTerminalCommands } from "./test-support/support/mountedTerminalCommands.ts";

export default defineConfig({
  plugins: [react()],
  test: {
    include: [
      "dashboard/frontend-tests/**/*.mounted.{spec,test}.?(c|m)[jt]s?(x)",
    ],
    includeTaskLocation: true,
    isolate: true,
    browser: {
      enabled: true,
      headless: true,
      viewport: { width: 390, height: 844 },
      provider: playwright({
        launchOptions: { args: dashboardBrowserArgs },
        contextOptions: { hasTouch: true },
      }),
      commands: { ...mountedDashboardCommands, ...mountedTerminalCommands },
      instances: [{ browser: "chromium" }],
    },
  },
});
