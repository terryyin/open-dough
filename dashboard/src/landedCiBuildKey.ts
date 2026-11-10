// The retained attempt identity shared by collection and local reading.
import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
export function buildKeyOf(
  build: BaseCiRunIdentity & { readonly revision: string },
) {
  if (build.adapterAttempt !== undefined)
    return `adapter/${JSON.stringify([String(build.adapterAttempt.runId), String(build.adapterAttempt.attemptId), build.revision])}`;
  if (build.runId !== undefined && build.runAttempt !== undefined)
    return `run/${String(build.runId)}/${String(build.runAttempt)}`;
  return `revision/${build.revision}`;
}
