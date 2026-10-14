// Accelerate only detached worker polling in multi-publication fixtures.
// Assertions still wait for actual observation, never elapsed time.
const workerPoll = `data:text/javascript,${encodeURIComponent(`
  import timers from 'node:timers/promises';
  import { syncBuiltinESMExports } from 'node:module';
  if (process.argv[2] === 'worker') {
    const pause = timers.setTimeout;
    timers.setTimeout = (ms, ...args) => pause(Math.min(ms, 50), ...args);
    syncBuiltinESMExports();
  }
`)}`;

export function workerPollingEnvironment(env) {
  return {
    ...env,
    NODE_OPTIONS: [env.NODE_OPTIONS, `--import=${workerPoll}`]
      .filter(Boolean)
      .join(" "),
  };
}
