import { test as base, expect } from "../dashboardTest.ts";
import { voiceProvider } from "./voiceProvider.ts";
export { expect };

export const test = base.extend<{
  transcriptionDeadlineMs: number | undefined;
  provider: Awaited<ReturnType<typeof voiceProvider>>;
}>({
  transcriptionDeadlineMs: [undefined, { option: true }],
  provider: async ({ transcriptionDeadlineMs }, use) => {
    const provider = await voiceProvider({
      deadlineMs: transcriptionDeadlineMs,
    });
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
