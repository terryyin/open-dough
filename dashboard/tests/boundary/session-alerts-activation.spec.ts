// Native API calls are mocked, while the actual emitted command/source runs.
// Browser UI and Notification Center clicks remain separate native acceptance.
import { expect } from "../support/pageTest.ts";
import { afterFurtherListings, start, test } from "../support/sessionAlerts.ts";
import { notificationActivation } from "../support/notificationActivation.ts";
import { browserActivation } from "../support/browserActivation.ts";

for (const bundle of ["com.apple.Safari", "com.google.Chrome"] as const) {
  test(`${bundle} notification reuses its existing dashboard tab and foregrounds its window`, async ({
    server,
  }) => {
    const session = await start(server);
    await afterFurtherListings(server);
    server.claudeSessionBecomes(session, "blocked", "Review this story");
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    const activation = notificationActivation(
      server.notifierCalls()[0]?.argv ?? [],
    );
    const unrelated = `${server.origin}/api/agent-launches`;
    const anotherPort = "http://127.0.0.1:1/?project=other";
    const native = browserActivation(activation.source, bundle, [
      [unrelated, anotherPort],
      ["https://example.invalid/", `${server.origin}/?project=other`],
    ]);
    const chosenWindow = native.windows[1];
    const chosenTab = chosenWindow?.tabs[1];
    expect(native.frontmost()).toBe(false);
    native.click(activation.destination);
    expect(native.alerts).toEqual([]);
    expect(native.frontmost()).toBe(true);
    expect(native.windows[0]).toBe(chosenWindow);
    expect(chosenWindow?.selected).toBe(2);
    expect(chosenWindow?.minimized).toBe(false);
    expect(chosenWindow?.tabs[1]).toBe(chosenTab);
    expect(chosenTab?.url).toBe(activation.destination);
    expect(native.windows.flatMap((window) => window.tabs)).toHaveLength(4);
    expect(native.windows[1]?.tabs.map((tab) => tab.url)).toEqual([
      unrelated,
      anotherPort,
    ]);
    native.click(activation.destination);
    expect(native.windows).toHaveLength(2);
    expect(native.windows.flatMap((window) => window.tabs)).toHaveLength(4);

    // An API document and another server's port are not dashboard tabs.
    const absent = browserActivation(activation.source, bundle, [
      [unrelated, anotherPort],
      ["about:blank"],
    ]);
    const frontWindow = absent.windows[0];
    absent.click(activation.destination);
    expect(absent.windows).toHaveLength(2);
    expect(absent.windows[0]).toBe(frontWindow);
    expect(frontWindow?.tabs.map((tab) => tab.url)).toEqual([
      unrelated,
      anotherPort,
      activation.destination,
    ]);
    expect(frontWindow?.selected).toBe(3);
    expect(absent.opened).toEqual([]);
    absent.click(activation.destination);
    expect(frontWindow?.tabs).toHaveLength(3);

    for (const options of [
      { running: true },
      { running: false },
      { running: false, windowDelay: 2, targetDelay: 4 },
      { running: true, targetDelay: 3 },
    ]) {
      const cold = browserActivation(activation.source, bundle, [], options);
      cold.click(activation.destination);
      expect(cold.alerts).toEqual([]);
      expect(cold.opened).toEqual([activation.destination]);
      expect(cold.windows).toHaveLength(1);
      expect(cold.windows[0]?.tabs[0]?.url).toBe(activation.destination);
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
        activation.source,
        bundle,
        [[`${server.origin}/?project=other`, unrelated]],
        options,
      );
      denied.click(activation.destination);
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
        `${server.origin}/?project=other`,
        unrelated,
      ]);
      expect(denied.frontmost()).toBe(false);
    }

    const normalized = browserActivation(activation.source, bundle, [
      ["http://LOCALHOST/"],
    ]);
    normalized.click("http://localhost:80/?project=target");
    expect(normalized.windows[0]?.tabs).toHaveLength(1);
    expect(normalized.windows[0]?.tabs[0]?.url).toBe(
      "http://localhost:80/?project=target",
    );
  });
}
