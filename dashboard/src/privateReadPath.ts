// The one path the browser and the local server side agree names the local
// authenticated read boundary (`../server/privateRead.ts`). Kept in its own
// module, with no Node import, so the browser bundle can reference the exact
// same literal without pulling in server-only code: `../server/privateRead.ts`
// itself imports Node's `child_process` at runtime (through `./ghRead.ts`),
// so nothing under `./` may import that module directly.
export const privateReadEndpoint = "/__private-read";
