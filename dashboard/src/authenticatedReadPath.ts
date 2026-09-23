// The one path the browser and the local server side agree names the local
// authenticated read boundary (`../server/authenticatedRead.ts`). Kept in its
// own module, with no Node import, so the browser bundle can reference the
// exact same literal without pulling in server-only code:
// `../server/authenticatedRead.ts` itself imports Node's `child_process` at
// runtime (through `./ghRead.ts`), so nothing under `./` may import that
// module directly.
export const authenticatedReadEndpoint = "/__authenticated-read";

// The longest wait, in whole seconds, the boundary ever passes on from a
// GitHub rate limit's direction (`../server/rateLimitDirection.ts`): GitHub's
// own primary rate-limit window. A header naming a later time is either wrong
// or will be repeated by the next refused answer, and a page left open must
// still check again. The browser reader refuses anything longer as malformed.
export const longestDirectedWaitSeconds = 60 * 60;
