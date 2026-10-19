"""Independent fixture owner restores unavailable inputs, without maintenance."""
from pathlib import Path
import json
import shutil
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
beta = root/'beta'

def git(*args):
    return subprocess.check_output(['git', '-C', str(beta), *args], text=True).strip()

if git('status', '--porcelain'):
    raise SystemExit('Fixture beta checkout has unrelated work; leave it untouched')
shutil.copy2(root/'beta-unavailable-DearDough.md', beta/'DearDough.md')
git('add', 'DearDough.md')
git('commit', '-m', 'Fixture owner restores unavailable source input')
git('push', 'origin', 'master')
(root/'block-alpha-shared').unlink()
(root/'restoration.json').write_text(json.dumps({
    'betaInputCommit': git('rev-parse', 'HEAD'),
    'restoredSourceBytes': (beta/'DearDough.md').read_bytes().hex(),
    'alphaBoundary': 'External block file removed; origin hook unchanged'}, indent=2)+'\n')
print((root/'restoration.json').read_text())
