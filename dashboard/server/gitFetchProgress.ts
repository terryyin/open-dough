// Git --progress emits CR-delimited counters on stderr. A byte counter can
// advance while the object count stays put, for example for one large object.
const progressLine =
  /^(?:remote: )?(Counting objects|Compressing objects|Receiving objects|Resolving deltas):\s+\d+% \((\d+)\/\d+\)(?:, (\d+(?:\.\d+)?) (bytes|KiB|MiB|GiB|TiB)(?: \| [^,]+)?)?(?:, done\.)?\s*$/;
const units = new Map(
  ["bytes", "KiB", "MiB", "GiB", "TiB"].map((unit, i) => [unit, 1024 ** i]),
);
const reportLimit = 4096;

function advancingGitReports(advance: () => void): (chunk: string) => void {
  const previous = new Map<string, { objects: number; bytes: number }>();
  let pending = "";
  return (chunk) => {
    const lines = (pending + chunk).split(/[\r\n]/);
    pending = (lines.pop() ?? "").slice(0, reportLimit);
    for (const line of lines) {
      if (line.length >= reportLimit) continue;
      const match = progressLine.exec(line.replaceAll("\u001b[K", ""));
      if (match === null) continue;
      const [, phase = "", count, amount, unit = ""] = match;
      const objects = Number(count);
      const bytes = Number(amount ?? 0) * (units.get(unit) ?? 1);
      const last = previous.get(phase) ?? { objects: 0, bytes: 0 };
      if (objects <= last.objects && bytes <= last.bytes) continue;
      previous.set(phase, {
        objects: Math.max(last.objects, objects),
        bytes: Math.max(last.bytes, bytes),
      });
      advance();
    }
  };
}

export async function whileGitProgresses<T>(
  lifetime: AbortSignal,
  inactivityMs: number,
  fetch: (signal: AbortSignal, report: (chunk: string) => void) => Promise<T>,
): Promise<T> {
  const inactivity = new AbortController();
  const signal = AbortSignal.any([lifetime, inactivity.signal]);
  const stalled = () => {
    inactivity.abort(
      new Error(
        `Initial sync stalled: Git made no progress for ${inactivityMs / 1000} seconds.`,
      ),
    );
  };
  let timeout = setTimeout(stalled, inactivityMs);
  const report = advancingGitReports(() => {
    if (signal.aborted) return;
    clearTimeout(timeout);
    timeout = setTimeout(stalled, inactivityMs);
  });
  try {
    return await fetch(signal, report);
  } catch (error) {
    signal.throwIfAborted();
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
