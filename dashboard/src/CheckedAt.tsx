import { Moment } from "./Moment.tsx";

// When something was last checked, as System settings Usage and the Board
// say it.
export const CheckedAt = ({ at }: { readonly at: string | null }) =>
  at === null ? (
    "Not checked yet"
  ) : (
    <>
      Checked <Moment at={new Date(at)} />
    </>
  );
