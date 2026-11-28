// A timeout from the provider's interim REST branch listing.
import type { OriginAnswer } from "../../test-support/originAnswers.ts";

export const gatewayTimeout: OriginAnswer = {
  status: 504,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify({ message: "Server Error" }),
};
