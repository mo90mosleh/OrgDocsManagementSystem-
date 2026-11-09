import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile('dist/server/index.js','utf8');
const manifest=JSON.parse(await readFile('dist/.openai/hosting.json','utf8'));
assert.ok(manifest.project_id);
const module=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
assert.equal(typeof module.default.fetch,'function');
console.log('Valid Worker ESM deployment artifact');
