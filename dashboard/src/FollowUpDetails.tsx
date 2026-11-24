import type { FollowUpItem } from "./followUpContext.ts";
import "./follow-up.css";

export function FollowUpDetails({
  items,
}: {
  readonly items: readonly FollowUpItem[];
}) {
  return (
    <dl className="follow-up-details">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
