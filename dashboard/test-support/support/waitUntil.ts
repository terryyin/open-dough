// Polls a condition a test can only observe by looking, such as a process
// being alive or a file existing, until it holds or the time is up, and
// answers whether it held.

export async function waitUntil(
  condition: () => boolean,
  { timeoutMs, intervalMs = 50 }: { timeoutMs: number; intervalMs?: number },
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return condition();
}
