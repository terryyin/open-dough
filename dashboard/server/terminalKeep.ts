// Settles one kept PTY before any socket: optional launch instruction, or a
// wait for the first painted screen or process exit when recovery omits it.
import type { IPty } from "@lydell/node-pty";
import type { LaunchInstructionInput } from "./launchInstruction.ts";
import type { LiveTerminalClient } from "./liveTerminalClient.ts";
import type { DetachedIdle } from "./launchHosts.ts";

export type KeptLaunch = LaunchInstructionInput & {
  readonly detachedIdle?: DetachedIdle;
};

export type KeepOutcome =
  | { readonly kind: "kept"; readonly screen?: string }
  | { readonly kind: "already-held" }
  | { readonly kind: "exited"; readonly text: string };

function keptFromScreen(screen: string): KeepOutcome {
  return screen.trim() === "" ? { kind: "kept" } : { kind: "kept", screen };
}

export async function settleKeep(input: {
  readonly existing: LiveTerminalClient | undefined;
  readonly pty: IPty;
  readonly launch?: KeptLaunch;
  readonly start: () => LiveTerminalClient;
  readonly tracked: (pty: IPty) => boolean;
}): Promise<KeepOutcome> {
  const { existing, pty, launch, start, tracked } = input;
  if (existing !== undefined) {
    try {
      pty.kill("SIGHUP");
    } catch {
      // The client already kept for this session is the one that stays.
    }
    return { kind: "already-held" };
  }
  const client = start();
  if (launch !== undefined) {
    await client.firstScreen;
    if (!tracked(pty)) {
      return { kind: "exited", text: await client.processExit };
    }
    return keptFromScreen(await client.screenText());
  }
  const signal = new AbortController();
  const shown = client.waitForScreen(
    (text) => text.trim().length > 0,
    signal.signal,
  );
  const exited = client.processExit.then((text) => ({
    kind: "exited" as const,
    text,
  }));
  const painted = shown.then(async (ready) => {
    if (!ready || !tracked(pty)) {
      return { kind: "exited" as const, text: await client.processExit };
    }
    return keptFromScreen(await client.screenText());
  });
  const outcome = await Promise.race([painted, exited]);
  signal.abort();
  return outcome;
}
