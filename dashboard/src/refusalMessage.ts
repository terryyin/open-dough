// What a local dashboard endpoint said when it refused or failed: the `error`
// message of its JSON answer, or `fallback` when the answer carries none.
export function refusalMessage(answer: unknown, fallback: string): string {
  return typeof answer === "object" &&
    answer !== null &&
    "error" in answer &&
    typeof answer.error === "string"
    ? answer.error
    : fallback;
}
