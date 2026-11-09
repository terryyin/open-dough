// @ts-check
// A native publication record in its maintained on-disk representation.
// Stream evidence and observations stay with the case, outside this builder.
export class NativeEvidenceRecordBuilder {
  /**
   * @param {{host: string, caseId: string, sourceRevision: string,
   * identity: string, promptHash: string, version: string, model: string,
   * runtimeSettings: string}} facts
   */
  with(facts) {
    return {
      please() {
        return [
          `host: ${facts.host}`,
          `case: ${facts.caseId}`,
          "origin: fresh",
          "execution-status: completed",
          "assessment-status: pass",
          "native-executable: controlled-native-host",
          `native-version: ${facts.version}`,
          `native-model: ${facts.model}`,
          `native-runtime-settings: ${facts.runtimeSettings}`,
          `source-revision: ${facts.sourceRevision}`,
          `fixture-commit: ${facts.sourceRevision}`,
          `prompt-identity: ${facts.promptHash}`,
          facts.identity.trimEnd(),
          "artifact-events: events.jsonl",
          "artifact-response: response.md",
          "artifact-stderr: stderr.log",
          "artifact-observations: observations.txt",
          "",
        ].join("\n");
      },
    };
  }
}
