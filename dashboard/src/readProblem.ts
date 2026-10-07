// A read that did not produce published work. Its message is written for the
// person looking at the dashboard; it never stands in for an empty backlog.
// When GitHub's rate limit stopped the read, it carries when the page's
// limit (`./readingLimit.ts`) lets reading resume. When the failure is safe
// for project-local transient recovery, it carries that eligibility as typed
// data validated at the local boundary (or set for the browser-owned wait
// bound), never inferred from a 502 wrapper or rendered prose.
export class ReadProblem extends Error {
  readonly resumesAt: Date | undefined;
  readonly recovery: "transient" | undefined;
  constructor(message: string, resumesAt?: Date, recovery?: "transient") {
    super(message);
    this.name = "ReadProblem";
    this.resumesAt = resumesAt;
    this.recovery = recovery;
  }
}
