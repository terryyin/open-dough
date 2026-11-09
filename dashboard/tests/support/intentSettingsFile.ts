// `.planning/open-dough.json` as a project publishes Intent settings built
// through `makeMe.intentSettings`: the one place tests encode that value at
// the file boundary. Settings whose exact bytes a case proves, such as
// malformed JSON, stay literal at that case.

import type { IntentSettings } from "../../../tests/support/intentLocationTestData.mjs";

export function intentSettingsText(settings: IntentSettings) {
  return `${JSON.stringify(settings, null, 2)}\n`;
}
