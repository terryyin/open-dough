// One request from this page to a machine-local JSON setting endpoint
// (`../server/localJsonEndpoints.ts`): a read without a body, or a change
// posting `body` as JSON. A refusal or failure rejects with the endpoint's own
// message, or `failure` when it gives none; the caller checks the answer.
import { refusalMessage } from "./refusalMessage.ts";

export async function localSettingRequest(
  endpoint: string,
  body: object | undefined,
  failure: string,
): Promise<unknown> {
  const response = await fetch(
    endpoint,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const answer: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(refusalMessage(answer, failure));
  return answer;
}
