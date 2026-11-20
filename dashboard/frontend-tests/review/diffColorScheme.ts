import { onTestFinished } from "vitest";
import { cdp } from "vitest/browser";

export function diffColorScheme() {
  const session = cdp() as {
    send(method: string, params: Record<string, unknown>): Promise<unknown>;
  };
  const set = (features: readonly { name: string; value: string }[]) =>
    session.send("Emulation.setEmulatedMedia", { features });
  onTestFinished(async () => {
    await set([]);
  });
  return async (scheme: "dark" | "light") => {
    await set([{ name: "prefers-color-scheme", value: scheme }]);
  };
}
