// What each operation the tool offers is for, and what it deliberately does
// not decide, in the words a caller reads when they ask for help or name an
// operation the tool does not have. Every refusal that hands back the usage
// hands back this one description.

import { queueHeading, takenHeading } from "./product-backlog-document.mjs";
import { defaultBacklogPath } from "./product-backlog-store.mjs";

export const usage = `Usage: product-backlog.mjs add --identity <id> --title <title> --link <href>
                             (--after <id> | --before <id> | --position first|last)
                             [--file <path>]
       product-backlog.mjs place --identity <id>
                             (--after <id> | --before <id> | --position first|last)
                             [--return] [--file <path>]
       product-backlog.mjs take --identity <id> (--plan <path> | --no-plan)
                             [--file <path>]
       product-backlog.mjs complete --identity <id> [--file <path>]
       product-backlog.mjs adopt --all [--file <path>]

add adds one already identified entry to "## ${queueHeading}" at the requested
relative position. Identities are supplied, never allocated there.

place moves one listed entry to a requested position in "## ${queueHeading}",
using the same relative destinations as add, and carries its line across
unchanged. It applies a priority the caller has decided and ranks nothing
itself. Returning work from "## ${takenHeading}" is stated explicitly with
--return; a destination alone never returns taken work.

take moves one identified entry to the end of "## ${takenHeading}", keeping its
identity and adding the selected plan link; an entry already there is resumed in
place. The plan decision is always stated: --plan names the active plan, and
--no-plan takes a quick story, or a correction whose canonical home is already
its plan. Taking work does not decide or grant execution authority.

complete removes one identified entry from whichever active list holds it,
applying a completion the caller has already decided. It never decides whether
work is complete, and it never deletes a story or plan file: closing those
canonical homes stays with the caller's wrap-up. Removal happens only on this
explicit request naming the identity.

adopt records one identity for every active entry in the canonical homes its
links name, reusing the ID each home already carries. It changes no membership,
order, or direction, and never runs implicitly: --all is required.

Paths are resolved against the current directory; --file defaults to
${defaultBacklogPath}.`;
