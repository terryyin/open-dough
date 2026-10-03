import { test as base, expect } from "../dashboardTest.ts";
import { voiceProvider } from "./voiceProvider.ts";
export { expect };

export const test = base.extend<{
  provider: Awaited<ReturnType<typeof voiceProvider>>;
}>({
  // Playwright requires the empty destructuring pattern for a dependency-free fixture.
  // eslint-disable-next-line no-empty-pattern
  provider: async ({}, use) => {
    const provider = await voiceProvider();
    try {
      await use(provider);
    } finally {
      await provider.close();
    }
  },
  machine: async ({ provider }, use) => {
    await use(provider.machine);
  },
  extraEnv: async ({ provider }, use) => {
    await use(provider.extraEnv);
  },
});
