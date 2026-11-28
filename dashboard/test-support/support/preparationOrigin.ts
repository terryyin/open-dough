// A preparation-page case's private origin (./preparationPage.ts). Both hosts'
// queued bases are worker preparation (./serverInputWorkerFixtures.ts), so the
// case starts its copy only once they are ready: a first case of either host,
// or with a later-revision override, copies a prepared base in its own time.
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import type { ReleasedInstallation } from "./taggedInstallation.ts";

type Host = "claude" | "codex";

export function preparationOrigin(
  start: (
    description: StartRepository,
    options: { host: Host; release: ReleasedInstallation | undefined },
  ) => Promise<StartOrigin>,
) {
  return async (
    {
      queuedOriginsReady,
      originRepository,
      preparationHost,
      preparationRelease,
    }: {
      queuedOriginsReady: unknown;
      originRepository: StartRepository;
      preparationHost: Host;
      preparationRelease?: ReleasedInstallation | undefined;
    },
    use: (origin: StartOrigin) => Promise<void>,
  ) => {
    await Promise.resolve(queuedOriginsReady);
    const origin = await start(originRepository, {
      host: preparationHost,
      release: preparationRelease,
    });
    await use(origin);
    origin.cleanup();
  };
}
