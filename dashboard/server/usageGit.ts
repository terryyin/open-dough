// Immutable Git evidence shared by historical story and plan discovery.
import { runGit } from "./gitRunner.ts";
const immutableReads = new Map<string, Promise<string | undefined>>();
export async function usageGit(
  cwd: string,
  args: string[],
): Promise<string | undefined> {
  const read = async () => {
    try {
      return (
        await runGit(args, { cwd, maxBuffer: 8 * 1024 * 1024 })
      ).stdout.trim();
    } catch {
      return undefined;
    }
  };
  if (
    !["show", "ls-tree", "log", "rev-parse"].includes(args[0] ?? "") ||
    !args.some((arg) => /^[a-f0-9]{40,64}(?::|$|\^)/i.test(arg))
  )
    return read();
  const key = JSON.stringify([cwd, args]);
  let pending = immutableReads.get(key);
  if (!pending) {
    pending = read();
    immutableReads.set(key, pending);
  }
  return pending;
}
