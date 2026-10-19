// Closing start admission is synchronous; starts already being admitted finish
// registering their owned work before the owner can drain its settlements.
import type { Acceptance } from "../src/agentLaunch.ts";
import { RefusedRequest } from "./localOrigin.ts";

export class LaunchAdmission {
  private draining = false;
  private readonly pending = new Set<Promise<Acceptance>>();

  async drain(): Promise<void> {
    this.draining = true;
    await Promise.allSettled(this.pending);
  }

  run(operation: () => Promise<Acceptance>): Promise<Acceptance> {
    if (this.draining)
      return Promise.reject(
        new RefusedRequest(
          503,
          "This dashboard is updating. Try again after the update completes.",
        ),
      );
    const admission = operation();
    this.pending.add(admission);
    void admission.then(
      () => this.pending.delete(admission),
      () => this.pending.delete(admission),
    );
    return admission;
  }
}
