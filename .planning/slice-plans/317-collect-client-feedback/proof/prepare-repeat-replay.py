"""Prepare an unchanged fresh-host cycle after independently accepted continuation."""
from pathlib import Path
import json, sys
root = Path(sys.argv[1]).resolve()
result = json.loads((root/'repeat-second-independent-result.json').read_text())
assert result['result'] == 'pass'
(root/'replay-prompt.txt').write_text(f'''Use $collect-client-feedback to run the next complete shared-feedback maintenance
cycle on {root}/inventory.json only. The established Open Dough integration
checkout is {root}/open-dough. Use the existing canonical catalog, linked findings,
watch, backlog, seeds and source logs. The supplied release/adoption/execution
receipts remain in evidence/usage.md and user review in evidence/noise.md.
This explicit invocation supplies collection, mapping adoption, justified cleanup,
selection and owned maintenance publication authority through each project's
ordinary delivery conventions. Assess current records and relevant history.
Do not implement responses, release/install guidance, read production inventory or
alter production repositories. Keep temporary output outside repositories.
Report concrete decisions, coverage and origin acceptance to
{root}/replay-cycle-report.md.
''')
print(root/'replay-prompt.txt')
