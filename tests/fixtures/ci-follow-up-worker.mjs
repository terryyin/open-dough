// Runs production ledger boundaries in separate processes; IPC is a barrier.
import {
  keepLandedCiResolution,
  readLandedCiHistory,
} from "../../dashboard/server/landedCiHistoryStore.ts";
import {
  readFollowUps,
  followUpKey,
} from "../../dashboard/server/ciFollowUpStore.ts";
import {
  registerFollowUpReceipt,
  saveFollowUpSetting,
  spendRepeat,
} from "../../dashboard/server/ciFollowUpAdmission.ts";
import {
  updateRepeat,
  withOriginalFollowUpSamples,
} from "../../dashboard/server/ciFollowUpRetention.ts";
process.once("message", async (input) => {
  try {
    let answer;
    if (input.action === "register")
      answer = await registerFollowUpReceipt(input.project, input.landing);
    if (input.action === "setting")
      answer = await saveFollowUpSetting(
        input.project,
        input.enabled,
        input.prior ?? [],
      );
    if (input.action === "spend" || input.action === "crash-before-send")
      answer = await spendRepeat(input.project, input.landing, input.request);
    if (input.action === "update")
      answer = await updateRepeat(
        followUpKey(input.project, input.landing),
        (request) => ({
          ...request,
          outcome: { ...request.outcome, explanation: "observer updated" },
        }),
      );
    if (input.action === "resolution")
      answer = await keepLandedCiResolution(
        input.project,
        input.landing,
        input.resolution,
        input.order,
      );
    if (input.action === "history")
      answer = await readLandedCiHistory(input.project);
    if (input.action === "samples")
      answer = await withOriginalFollowUpSamples(input.project, input.history);
    if (input.action === "read") answer = await readFollowUps();
    process.send({ ok: true, answer });
    if (input.action !== "crash-before-send") process.disconnect();
  } catch (error) {
    process.send({ ok: false, error: error.message });
    process.disconnect();
  }
});
