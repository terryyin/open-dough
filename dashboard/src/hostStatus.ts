// This machine's host headroom as the dashboard server samples it
// (`../server/hostStatusObservation.ts`) and the Sessions sidebar's title row
// shows it: whole-machine CPU usage as a percentage averaged over about the
// last minute, and the bytes free on the volume of this machine's dashboard
// home. Each figure is `null` when it could not be read; neither is ever
// invented. What crosses the HTTP boundary is checked as external input.

import { z } from "zod";

export const hostStatusEndpoint = "/__host-status";

const hostStatusSchema = z.object({
  cpuPercent: z.number().min(0).max(100).nullable(),
  freeBytes: z.number().nonnegative().nullable(),
});

export type HostStatus = z.infer<typeof hostStatusSchema>;

// A figure as the title row shows it: the compact value beside its icon and
// the full wording its accessible name and tooltip carry.
type HostFigureShown = {
  readonly shown: string;
  readonly words: string;
};

// What an unread figure shows beside its icon.
const unavailableShown = "—";

export function cpuShown(percent: number | null): HostFigureShown {
  if (percent === null)
    return { shown: unavailableShown, words: "CPU unavailable" };
  const rounded = `${String(Math.round(percent))}%`;
  return { shown: rounded, words: `CPU ${rounded}` };
}

const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

// Bytes in a compact decimal unit: one decimal below ten, whole above.
function compactBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const amount =
    value < 10 && unit > 0
      ? String(Math.round(value * 10) / 10)
      : String(Math.round(value));
  return `${amount} ${units[unit] ?? "B"}`;
}

export function freeDiskShown(bytes: number | null): HostFigureShown {
  if (bytes === null)
    return { shown: unavailableShown, words: "Free disk unavailable" };
  const compact = compactBytes(bytes);
  return { shown: compact, words: `${compact} free` };
}

// Both figures unread.
const unread: HostStatus = { cpuPercent: null, freeBytes: null };

// The host status the server answers, or both figures unread when no
// trustworthy answer came.
export async function readHostStatus(signal: AbortSignal): Promise<HostStatus> {
  try {
    const response = await fetch(hostStatusEndpoint, { signal });
    if (!response.ok) return unread;
    const answer = hostStatusSchema.safeParse(await response.json());
    return answer.success ? answer.data : unread;
  } catch {
    return unread;
  }
}
