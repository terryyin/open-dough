import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { dashboardBrowserArgs } from "./test-support/support/browserArgs.ts";
import { phoneBoardCommands } from "./test-support/support/mountedPhoneBoardCommands.ts";

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
      commands: phoneBoardCommands,
      instances: [{ browser: "chromium" }],
    },
  },
});
