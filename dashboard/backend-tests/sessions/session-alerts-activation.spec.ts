// Production callback source against native Safari/Chrome API stand-ins.
// Inline-command emission stays in ./session-alerts-activation-command.spec.ts.
// Browser UI and Notification Center clicks remain separate native acceptance.
import { expect, test } from "vitest";
import { notificationActivationSource } from "../../server/notificationActivation.ts";
import { browserActivation } from "../../test-support/support/browserActivation.ts";

const origin = "http://127.0.0.1:58312";
const destination = `${origin}/?project=open-dough&story=SEED-413%23activation`;
const unrelated = `${origin}/api/agent-launches`;
const anotherPort = "http://127.0.0.1:1/?project=other";
const eligible = `${origin}/?project=other`;

for (const bundle of ["com.apple.Safari", "com.google.Chrome"] as const) {
  test(`${bundle} notification reuses its existing dashboard tab and foregrounds its window`, () => {
    const native = browserActivation(notificationActivationSource, bundle, [
      [unrelated, anotherPort],
      ["https://example.invalid/", eligible],
    ]);
    const chosenWindow = native.windows[1];
    const chosenTab = chosenWindow?.tabs[1];
    expect(native.frontmost()).toBe(false);
    native.click(destination);
    expect(native.alerts).toEqual([]);
    expect(native.frontmost()).toBe(true);
    expect(native.windows[0]).toBe(chosenWindow);
    expect(chosenWindow?.selected).toBe(2);
    expect(chosenWindow?.minimized).toBe(false);
    expect(chosenWindow?.tabs[1]).toBe(chosenTab);
    expect(chosenTab?.url).toBe(destination);
    expect(native.windows.flatMap((window) => window.tabs)).toHaveLength(4);
    expect(native.windows[1]?.tabs.map((tab) => tab.url)).toEqual([
      unrelated,
      anotherPort,
    ]);
    native.click(destination);
    expect(native.windows).toHaveLength(2);
    expect(native.windows.flatMap((window) => window.tabs)).toHaveLength(4);

    // An API document and another server's port are not dashboard tabs.
    const absent = browserActivation(notificationActivationSource, bundle, [
      [unrelated, anotherPort],
      ["about:blank"],
    ]);
    const frontWindow = absent.windows[0];
    absent.click(destination);
    expect(absent.windows).toHaveLength(2);
    expect(absent.windows[0]).toBe(frontWindow);
    expect(frontWindow?.tabs.map((tab) => tab.url)).toEqual([
      unrelated,
      anotherPort,
      destination,
    ]);
    expect(frontWindow?.selected).toBe(3);
    expect(absent.opened).toEqual([]);
    absent.click(destination);
    expect(frontWindow?.tabs).toHaveLength(3);

    for (const options of [
      { running: true },
      { running: false },
      { running: false, windowDelay: 2, targetDelay: 4 },
      { running: true, targetDelay: 3 },
    ]) {
      const cold = browserActivation(
        notificationActivationSource,
        bundle,
        [],
        options,
      );
      cold.click(destination);
      expect(cold.alerts).toEqual([]);
      expect(cold.opened).toEqual([destination]);
      expect(cold.windows).toHaveLength(1);
      expect(cold.windows[0]?.tabs[0]?.url).toBe(destination);
      expect(cold.frontmost()).toBe(true);
      expect(cold.ticks()).toBeGreaterThanOrEqual(options.targetDelay ?? 0);
    }

    for (const options of [
      { readErrorAt: unrelated },
      { windowsError: true },
      { writeError: true },
      { defaultBrowser: "unsupported-browser" },
    ]) {
      const denied = browserActivation(
        notificationActivationSource,
        bundle,
        [[eligible, unrelated]],
        options,
      );
      denied.click(destination);
      expect(denied.alerts).toEqual([
        {
          title: "Dashboard story could not be opened",
          options: {
            message:
              "Open the dashboard manually. For future alerts, use Safari or Google Chrome as your default browser and enable that browser under System Settings → Privacy & Security → Automation → Open Dough.",
          },
        },
      ]);
      expect(denied.opened).toEqual([]);
      expect(denied.windows).toHaveLength(1);
      expect(denied.windows[0]?.tabs.map((tab) => tab.url)).toEqual([
        eligible,
        unrelated,
      ]);
      expect(denied.frontmost()).toBe(false);
    }

    const normalized = browserActivation(notificationActivationSource, bundle, [
      ["http://LOCALHOST/"],
    ]);
    normalized.click("http://localhost:80/?project=target");
    expect(normalized.windows[0]?.tabs).toHaveLength(1);
    expect(normalized.windows[0]?.tabs[0]?.url).toBe(
      "http://localhost:80/?project=target",
    );
  });
}
