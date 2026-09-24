// What one performed read of the local authenticated read boundary
// (`./authenticatedRead.ts`) comes to: an answer, a refusal, or a reported
// failure. Shared by `./performedRead.ts` and `./performedBranchRead.ts`.

import type { ReportedFailure } from "./readFailureMessage";

// What a successful read answers, as the browser reader
// (`../src/authenticatedRead.ts`, `../src/authenticatedBranchRead.ts`) checks it.
export type PinnedFile = { readonly path: string; readonly text: string };
type Answer =
  | { readonly revision: string; readonly backlog: string }
  | ({ readonly revision: string } & PinnedFile)
  | { readonly revision: string; readonly changed: boolean }
  | {
      readonly revision: string;
      readonly path: string;
      readonly committedAt: string;
    }
  | { readonly revision: string; readonly profiles: readonly PinnedFile[] }
  // A recorded branch's head, or null when it is no longer published.
  | {
      readonly revision: string;
      readonly branch: string;
      readonly head: string | null;
    }
  // A path read at a branch head: null when that head does not have it.
  | {
      readonly revision: string;
      readonly path: string;
      readonly text: string | null;
    };

export type Outcome =
  | { readonly kind: "answered"; readonly answer: Answer }
  | {
      readonly kind: "refused";
      readonly status: number;
      readonly message: string;
    }
  | ({ readonly kind: "failed" } & ReportedFailure);

export function answered(answer: Answer): Outcome {
  return { kind: "answered", answer };
}

export const unreachable: Outcome = {
  kind: "refused",
  status: 404,
  message: "That path is not reachable from this source revision.",
};
