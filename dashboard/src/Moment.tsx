// A recorded instant, shown the same way wherever the dashboard reports one.
export function Moment({ at }: { readonly at: Date }) {
  return <time dateTime={at.toISOString()}>{at.toLocaleString()}</time>;
}
