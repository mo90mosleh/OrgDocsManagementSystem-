import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{departmentTone,processMapLayout}from'../portal/process-map-layout.ts';
const data=JSON.parse(await readFile(new URL('../data/rassan-presentation.json',import.meta.url),'utf8'));
test('map lays out every real process including isolates without overlapping cards',()=>{
 const graph=processMapLayout(data,data.relations??[]),items=[...graph.positions];
 assert.equal(items.length,44);assert.equal(graph.links.length,19);
 for(let i=0;i<items.length;i++){const[aId,a]=items[i];assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));for(const[bId,b]of items.slice(i+1))assert.ok(a.x+248<=b.x||b.x+248<=a.x||a.y+112<=b.y||b.y+112<=a.y,`${aId} overlaps ${bId}`);}
 assert.deepEqual(processMapLayout(data,data.relations??[]).positions,graph.positions);
});
test('invalid links are excluded and relation cycles never prevent layout',()=>{
 const ids=data.nodes.filter(n=>n.kind==='PROCESS').slice(0,3).map(p=>p.id);
 const relations=ids.map((id,i)=>({source_process_id:id,target_process_id:ids[(i+1)%3],relation_type:'RELATED'}));
 relations.push({source_process_id:ids[0],target_process_id:'missing',relation_type:'RELATED'});
 const graph=processMapLayout(data,relations);assert.equal(graph.links.length,3);assert.equal(graph.positions.size,44);
});
test('department tint is stable across card selection and has a neutral ownerless fallback',()=>{
 const ids=data.units.map(u=>u.id);for(const id of ids)assert.deepEqual(departmentTone(id),departmentTone(id));
 assert.ok(new Set(ids.map(id=>departmentTone(id).color)).size>ids.length*.8);
 assert.equal(departmentTone(null).color,'#64748b');
});
