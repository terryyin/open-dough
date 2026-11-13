// The frame each glance history reads in, a Done comparison's CI wall time
// (`./IntentCiDoneWallTimeReference.tsx`) and a scope's test execution time
// (`./IntentScopeTimingHistory.tsx`): its heading, brief status and any
// action on one row, then the view's own reading, then a failed read's alert
// beside a short retry. Each view owns its read and what it shows.
import { useId, type ReactNode } from "react";
import "./intent-ci-history.css";

export function IntentCiHistoryPanel({
  title,
  status,
  action,
  failed,
  retry,
  children,
}: {
  readonly title: string;
  readonly status: string | undefined;
  readonly action?: ReactNode;
  readonly failed: string | undefined;
  readonly retry: () => void;
  readonly children: ReactNode;
}) {
  const heading = useId();
  return (
    <section
      className="intent-ci-history intent-ci-history-panel"
      aria-labelledby={heading}
    >
      <div className="intent-ci-history-head">
        <h4 id={heading}>{title}</h4>
        {status !== undefined && (
          <span className="intent-ci-history-status">{status}</span>
        )}
        {action}
      </div>
      {children}
      {failed !== undefined && (
        <div className="intent-ci-history-failure">
          <p role="alert">{failed}</p>
          <button type="button" onClick={retry}>
            Retry history
          </button>
        </div>
      )}
    </section>
  );
}
