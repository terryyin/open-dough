// Intent's review scope, the whole story or one of its sessions, chosen
// from a compact dropdown (./CompactSelect.tsx) whose closed combobox
// announces the chosen scope. An ad hoc session shows its title after an "Ad hoc" icon. A
// choice commits the session's existing key, so options that read alike
// still choose their own session.
import { CompactSelect, type CompactSelectOption } from "./CompactSelect.tsx";
import type { SessionScope } from "./followUpSessions.ts";
import "./intent-scope-select.css";

const wholeStory: CompactSelectOption = {
  id: "whole-story",
  label: "Whole story",
};

function adHocLabel(title: string) {
  return (
    <>
      <span className="intent-scope-ad-hoc" role="img" aria-label="Ad hoc" />{" "}
      {title}
    </>
  );
}

export function IntentScopeSelect({
  sessions,
  session,
  onSession,
}: {
  readonly sessions: readonly SessionScope[];
  readonly session: string | undefined;
  readonly onSession: (session: string | undefined) => void;
}) {
  const options: readonly CompactSelectOption[] = [
    wholeStory,
    ...sessions.map(({ key, label, adHoc }) => ({
      id: key,
      label: adHoc ? adHocLabel(label) : label,
    })),
  ];
  const chosen = options.find(({ id }) => id === session) ?? wholeStory;
  return (
    <CompactSelect
      name="Review scope"
      options={options}
      value={chosen.id}
      current={chosen.label}
      onCommit={({ id }) => {
        onSession(id === wholeStory.id ? undefined : id);
      }}
      rootClassName="intent-scope-select"
      buttonClassName="intent-scope-select-button"
      listClassName="intent-scope-select-list"
    />
  );
}
