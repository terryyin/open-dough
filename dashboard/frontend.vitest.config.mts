import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { dashboardBrowserArgs } from "./tests/support/browserArgs.ts";
import { phoneBoardCommands } from "./tests/support/mountedPhoneBoardCommands.ts";

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
      provider: playwright({
        launchOptions: { args: dashboardBrowserArgs },
        contextOptions: { hasTouch: true },
      }),
      commands: phoneBoardCommands,
      instances: [{ browser: "chromium" }],
    },
  },
});
