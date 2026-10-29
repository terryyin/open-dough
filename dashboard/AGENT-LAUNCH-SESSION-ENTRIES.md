# Dashboard session entries

The [session history contract](AGENT-LAUNCH-HISTORY.md) defines their membership,
retention and native-state observation.

Card, local Taken and Recently done session entries use the same compact scan:
native state and attention, host and qualified requested model, then the primary
**Open terminal** or **Read final report** action. On a story card, a matching
assignment above already names the session's host and model, so the summary
omits those repeated facts. Different or unrecorded assignments keep the
session's known launch facts visible; standalone entries also keep them.
**Session details** retains the host and qualified requested model. It starts
closed and discloses the launch time, original attribution, requested options
and policy, local launch provenance, one saved workspace, session ID and manual
resume command. Where available, **Copy resume command** copies that command;
failure says so and leaves it selectable. Closing details leaves main access
available. An open execution session suppresses the story scan's positive
**Ready for execution** badge; its preparation facts remain in **Inspect story**.
Dependency/readiness warnings and qualified published slice/branch facts remain.

**More session actions** is a separate disclosure for the existing Stop,
Mark as done and Delete record controls, offered according to their host/state
capabilities. It preserves their in-place questions, pending states and focus
return. Escape closes the action disclosure, except while an asking control
handles Escape to keep the session open. Recovery, first-input uncertainty,
workspace limitations, unread reports and operation failures remain visible
with Session details closed; local-only Done still warns that it did not stop
the native session. Disclosures wrap at narrow widths and their buttons obey
the story's disabled startup frame.

An assigned session shows its original agent and human credit at the saved
allocation revision, beside its native host and requested model (or the model
recorded at that assignment). This session attribution remains after assignment
release and is separate from the story's current Preparing or Taken owner.
Later allocations, including reuse of the same agent name, cannot replace it.
Legacy records without allocation evidence and unreadable historical records
keep their known launch facts and explicitly show “Human developer unknown.”
