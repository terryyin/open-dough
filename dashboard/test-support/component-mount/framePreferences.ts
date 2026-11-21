import { onTestFinished } from "vitest";

export const sidebarKey = "open-dough.sessionsSidebar.open";

export function withClosedSessionsSidebar() {
  withFramePreference(sidebarKey, "false");
}

export function withFramePreference(key: string, initial: string | null) {
  const kept = localStorage.getItem(key);
  const store = (value: string | null) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  };
  onTestFinished(() => {
    store(kept);
  });
  store(initial);
}
