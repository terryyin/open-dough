"""Capture raw origin state for human assessment; makes no pass/fail judgment."""
from pathlib import Path
import json
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
initial = json.loads((root/'initial-heads.json').read_text())
result = {}
for name, branch in [('open-dough', 'main'), ('alpha', 'master')]:
    bare = root/f'{name}.git'
    def git(*args):
        return subprocess.check_output(['git', '--git-dir', str(bare), *args], text=True).strip()
    head = git('rev-parse', f'refs/heads/{branch}')
    paths = git('ls-tree', '-r', '--name-only', head).splitlines()
    selected = [p for p in paths if p in ['DearDough.md', 'notes/ProjectFindings.md', '.planning/PRODUCT-BACKLOG.md'] or p.startswith(('.planning/seeds/', 'docs/maintainer/findings/'))]
    commits = git('rev-list', '--reverse', f'{initial[name]}..{head}').splitlines()
    result[name] = {'target': f'origin/refs/heads/{branch}', 'head': head,
                    'accepted': (root/f'{name}-accepted.txt').read_text() if (root/f'{name}-accepted.txt').exists() else '',
                    'commits': [{'sha': sha, 'subject': git('show', '-s', '--format=%s', sha),
                                 'changed': git('diff-tree', '--no-commit-id', '--name-only', '-r', sha).splitlines(),
                                 'records': {p: git('show', f'{sha}:{p}') for p in selected if p in git('ls-tree', '-r', '--name-only', sha).splitlines()}}
                                for sha in commits],
                    'records': {p: git('show', f'{head}:{p}') for p in selected}}
print(json.dumps(result, indent=2))
