// A passive read of a retained conversation's final report. Failure concerns
// this read only; it does not establish conversation absence or completion.
export type SessionResult =
  | {
      readonly kind: "available";
      readonly turnId: string;
      readonly text: string;
    }
  | { readonly kind: "unavailable"; readonly explanation: string };
