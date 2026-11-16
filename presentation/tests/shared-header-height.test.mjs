import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
test('shared header height matches compact chart on desktop and existing mobile height',async()=>{
 const shared=await readFile(new URL('../portal/design-system.css',import.meta.url),'utf8');
 const chart=await readFile(new URL('../portal/chart-shell.css',import.meta.url),'utf8');
 const mobile=await readFile(new URL('../portal/mobile.css',import.meta.url),'utf8');
 assert.match(shared,/--app-header-height:\s*60px/);
 assert.match(shared,/\.app:not\(\.chart-focus-mode\)\s+\.topbar\s*\{[^}]*height:\s*var\(--app-header-height\)/);
 assert.match(shared,/@media\(max-width:760px\)\s*\{\s*:root\s*\{\s*--app-header-height:\s*var\(--mobile-header-height,\s*56px\)/);
 assert.match(chart,/\.app\.chart-focus-mode:not\(\.chart-immersive\)\s+\.topbar\s*\{[^}]*height:\s*var\(--app-header-height,\s*60px\)/);
 assert.match(mobile,/--mobile-header-height:56px/);
 // Keep the existing shared component semantics and graph toggles.
 const chartCode=await readFile(new URL('../portal/Chart.tsx',import.meta.url),'utf8');
 assert.match(chartCode,/SegmentedControl label="محتوای چارت"/);
 assert.match(chartCode,/SegmentedControl label="جهت نمایش چارت"/);
 assert.match(chartCode,/SegmentedControl label="نمایش چارت"/);
});
