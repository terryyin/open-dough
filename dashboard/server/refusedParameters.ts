// A read request the local authenticated read boundary
// (`./authenticatedRead.ts`) refuses for its parameters alone, before any
// `gh` call: every parse of what a request asks for (`./requestedRead.ts`,
// `./containmentRead.ts`) answers it the same way.
export type RefusedParameters = {
  readonly kind: "refused";
  readonly status: 400;
  readonly message: string;
};

export function refused(message: string): RefusedParameters {
  return { kind: "refused", status: 400, message };
}
