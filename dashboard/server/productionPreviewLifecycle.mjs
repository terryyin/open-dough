// Own a working preview through drain, replacement, restoration and shutdown.
// Staging and checkout retirement remain with the deployment caller.
import { startDeploymentPreview } from "./productionPreview.mjs";

/**
 * @typedef {{directory: string, commit: string}} BuiltDeployment
 * @param {BuiltDeployment & {port?: number, env?: NodeJS.ProcessEnv, signal?: AbortSignal}} options
 */
export async function startProductionPreview(options) {
  const { env, signal } = options;
  let source = { directory: options.directory, commit: options.commit };
  let preview = await startDeploymentPreview(options);
  const port = Number(new URL(preview.url).port);
  let exit;
  function observe(running) {
    exit = undefined;
    void running.exited.then((ended) => {
      if (preview === running) exit = ended;
    });
  }
  const start = (directory) =>
    startDeploymentPreview({ directory, port, env, signal });
  observe(preview);
  return {
    get current() {
      if (preview === undefined) return undefined;
      return { ...source, url: preview.url, pid: preview.pid };
    },
    check() {
      if (exit !== undefined) {
        throw new Error(
          `Production dashboard exited unexpectedly (${exit.signal ?? exit.code}).`,
        );
      }
    },
    /**
     * @param {BuiltDeployment} candidate
     * @returns {Promise<{kind: "activated"} | {kind: "kept" | "restored", error: unknown}>}
     */
    async replace(candidate) {
      try {
        await preview.drain(signal);
        signal?.throwIfAborted();
        await preview.stop();
      } catch (error) {
        signal?.throwIfAborted();
        return { kind: "kept", error };
      }
      preview = undefined;
      try {
        preview = await start(candidate.directory);
      } catch (error) {
        signal?.throwIfAborted();
        try {
          preview = await start(source.directory);
        } catch (restorationError) {
          throw new Error(
            `${candidate.commit} failed: ${error.message}; restoring ${source.commit} also failed: ${restorationError.message}`,
            { cause: restorationError },
          );
        }
        observe(preview);
        return { kind: "restored", error };
      }
      source = candidate;
      observe(preview);
      return { kind: "activated" };
    },
    async stop() {
      await preview?.stop();
      preview = undefined;
    },
  };
}
