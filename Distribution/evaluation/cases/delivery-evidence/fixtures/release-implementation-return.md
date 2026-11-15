Implemented slice 3's status projection in `deployment/status.py`.
The command emits image identity, container state, API status code and the
newest operation's running/finished phase, last completed stage, start/end,
elapsed seconds, outcome and error. It reads the supplied record once and
does not contact the application or emit its response body.

proof:
  command: python3 -m unittest discover -s tests -p 'test_*.py'
  covers: newest-operation summary, identity, container state, API code, no body
  boundary: JSON stdout from python3 deployment/status.py INPUT.json
  observations:
    - tests/test_status.py asserts the summary for healthy and completed records
    - tests/test_status.py asserts identity, running container and API code
    - tests/test_status.py rejects an application body in the output
  setup: records/*.json supply existing independent operation/container facts
  result: pass, three tests

Live helper output and coordinator orchestration remain with slice 4.
Status after the coordinator ends is an owner decision for future work.
This increment is ready for acceptance.
