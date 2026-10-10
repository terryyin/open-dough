// Vite asked for any free port (`--port 0`) chooses one by probing it and then
// binding it, so another listener can take that port in between; Vite then
// fails with "Port N is already in use". A start that lost its own choice that
// way starts again and chooses afresh. A port the caller named is never
// replaced.

const attempts = 3;

/**
 * Runs `start` until it succeeds, again only after it lost a port Vite chose.
 * `start` ends whatever it launched before it throws, and its error message
 * carries that launch's output.
 * @template T
 * @param {number | undefined} port `0` or `undefined` for any free port
 * @param {() => Promise<T>} start
 * @returns {Promise<T>}
 */
export async function startOnChosenPort(port, start) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await start();
    } catch (error) {
      if (
        (port !== undefined && port !== 0) ||
        attempt >= attempts ||
        !(error instanceof Error) ||
        !/Port \d+ is already in use/.test(error.message)
      )
        throw error;
    }
  }
}
