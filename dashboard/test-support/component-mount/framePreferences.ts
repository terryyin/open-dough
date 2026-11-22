import { onTestFinished } from "vitest";

export const sidebarKey = "open-dough.sessionsSidebar.open";
export const positionKey = "open-dough.board.position";
export const formerPositionKey = "open-dough.dashboardColumns.position";

// The keys this case chose, each restored to what was kept when it ends.
const chosen = new Set<string>();

export function withClosedSessionsSidebar() {
  withFramePreference(sidebarKey, "false");
}

// Every page mount starts from the page preferences it can change, unless the
// case chose one before mounting: the Sessions sidebar closed (unless `kept`)
// and the Board at its first column, kept in storage so the page's own
// position choice is not read. The case's end restores what was kept. A case
// that refused the browser's storage keeps nothing there to reset.
export function withPagePreferences({
  sessionsSidebar = "closed",
}: { readonly sessionsSidebar?: "closed" | "kept" } = {}) {
  if (storageRefused()) return;
  if (sessionsSidebar === "closed") withClosedSessionsSidebar();
  else withDefaultFramePreference(sidebarKey, localStorage.getItem(sidebarKey));
  withDefaultFramePreference(positionKey, "0");
  withDefaultFramePreference(formerPositionKey, null);
}

function storageRefused() {
  try {
    localStorage.getItem(sidebarKey);
    return false;
  } catch {
    return true;
  }
}

function withDefaultFramePreference(key: string, initial: string | null) {
  if (!chosen.has(key)) withFramePreference(key, initial);
}

export function withFramePreference(key: string, initial: string | null) {
  const store = (value: string | null) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  };
  if (!chosen.has(key)) {
    chosen.add(key);
    const kept = localStorage.getItem(key);
    onTestFinished(() => {
      chosen.delete(key);
      store(kept);
    });
  }
  store(initial);
}
