"""Add catalog metadata and license to the generated official engine package."""
from pathlib import Path
import hashlib
import html
import json

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
for folder in [root / 'game', dist]:
    (folder / 'LICENSE').write_bytes((root / 'LICENSE').read_bytes())
manifest = dict(line.split('=', 1) for line in (dist / 'starhermit.txt').read_text().splitlines()
                if '=' in line and not line.startswith('#'))
p = dist / 'index.html'
s = p.read_text()
s = s.replace('<title>Uzhhorod</title>', '<title>Uzhhorod · After the Rain</title>')
if '<meta name="description"' not in s:
    s = s.replace('</head>', '<meta name="description" content="' + html.escape(manifest['description'], quote=True) + '">\n</head>')
p.write_text(s)
index = {'format': 1, 'files': {str(p.relative_to(dist)): {
    'size': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
    for p in sorted(dist.rglob('*')) if p.is_file() and p.name != 'starhermit-files.json'}}
(dist / 'starhermit-files.json').write_text(json.dumps(index, indent=2) + '\n')
