"""Validate a handoff and prepare deterministic records; never contacts a database."""
import json,sys,hashlib,uuid,collections
from pathlib import Path
from urllib.parse import urlparse
source=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
raw=source.read_bytes();package=json.loads(raw.decode('utf-8-sig'));records=package['records'];org='8847c22d-0282-5b07-80b1-d34bc41a4efa';ns=uuid.UUID(org)
assert len(records)==44 and len({r['code'] for r in records})==44
codes={r['code'] for r in records};revision=str(package['revision']);sha=hashlib.sha256(raw).hexdigest();batch=str(uuid.UUID(sys.argv[3])) if len(sys.argv)>3 else str(uuid.uuid5(ns,'batch:'+sha))
items=[]
def ident(table,key):return str(uuid.uuid5(ns,table+':'+key))
def add(table,key,data):
 row={'id':ident(table,key),'organization_id':org,**data};items.append({'table':table,'source_key':key,'values':row});return row['id']
def draft():return {'content_status':'DRAFT','content_revision':revision}
def lines(a):return '\n'.join(a)
owners=list(dict.fromkeys(r['source']['owner'] for r in records));groups=list(dict.fromkeys(r['proposed']['architecture_group'] for r in records))
owner_ids={o:add('org_units','owner:'+o,{'name':o,'code':'RAS-OWN-'+hashlib.sha256(o.encode()).hexdigest()[:8].upper(),'parent_id':None,'sort_order':i+1})for i,o in enumerate(owners)}
group_ids={g:add('process_nodes','group:'+g,{'kind':'GROUP','code':'RAS-G-'+hashlib.sha256(g.encode()).hexdigest()[:8].upper(),'name':g,'parent_id':None,'classification':None,'summary':None,'owner_org_unit_id':None,'visibility':'RESTRICTED',**draft()})for g in groups}
for r in records:
 assert r['status']=='DRAFT';s=r['source'];p=r['proposed'];k=p['kpi'];code=r['code'];assert all(isinstance(s[x],str) for x in ['name','owner','description']);assert k['target_value'] is None
 assert all(x in codes and x!=code for x in p['related_processes']);assert k['code']=='KPI-'+code
 pid=add('process_nodes','process:'+code,{'kind':'PROCESS','code':code,'name':s['name'],'summary':s['description'],'owner_org_unit_id':owner_ids[s['owner']],'parent_id':group_ids[p['architecture_group']],'classification':None,'visibility':'RESTRICTED','source_data':s,'proposed_data':p,**draft()})
 add('process_profiles','profile:'+code,{'process_id':pid,'objective':p['objective'],'start_event':p['start_event'],'end_event':p['end_event'],'inputs':lines(p['inputs']),'outputs':lines(p['outputs']),'roles':lines(s['initiators']),'expected_outcome':lines(p['outputs']),'notes':None,**draft()})
 ref=p['system_reference'];add('bpms_references','bpms:'+code,{'process_id':pid,'system_name':ref['system'],'workflow_code':ref.get('workflow_code'),'workflow_name':ref['workflow_name'],'url':None,'main_steps':lines(p['main_steps']),'decision_rules':None,'kpi_events':k['start_event']+' → '+k['end_event'],'notes':'پرسش باز برای بازبینی: '+p['control_question'],'control_question':p['control_question'],**draft()})
 kid=add('kpis','kpi:'+k['code'],{'code':k['code'],'name':k['name'],'description':k['quality_rule'],'purpose':p['objective'],'formula_text':k['formula'],'numerator_text':None,'denominator_text':None,'unit':k['unit'],'preferred_direction':k['preferred_direction'],'frequency':k['frequency'],'owner_person_id':None,'data_source':k['data_source'],'breakdown_level':k['grain'],'target_value':None,'readiness_status':k['readiness_status'],**draft()})
 add('process_kpis','process-kpi:'+code,{'process_id':pid,'kpi_id':kid})
 for suffix,label,field in [('start','رخداد آغاز',k['start_event']),('end','رخداد پایان',k['end_event']),('case','شناسهٔ مورد','شناسهٔ مشترک هر مورد در هر دو رخداد')]:
  add('kpi_data_requirements','requirement:'+code+':'+suffix,{'kpi_id':kid,'system_name':ref['system'],'entity_name':s['name'],'field_or_event_name':field,'required_for':label+' — '+k['grain'],'availability_note':k['quality_rule'],'is_available':None,**draft()})
 for doc in r['documents']:
  assert urlparse(doc['url']).scheme=='https' and urlparse(doc['url']).netloc
  add('documents','document:'+code+':'+doc['url'],{'process_id':pid,'title':doc['title'],'doc_type':doc['type'],'file_path':None,'external_url':doc['url'],'mime_type':'application/pdf','uploaded_by':None,'import_batch_id':batch,**draft()})
for r in records:
 for target in r['proposed']['related_processes']:
  add('process_relations','relation:'+r['code']+':'+target+':RELATED',{'source_process_id':ident('process_nodes','process:'+r['code']),'target_process_id':ident('process_nodes','process:'+target),'relation_type':'RELATED','note':'ارتباط پیشنهادی برای بازبینی',**draft()})
assert len({(i['table'],i['source_key'])for i in items})==len(items)
counts=dict(collections.Counter(i['table'] for i in items));assert counts['documents']==90 and counts['process_profiles']==44 and counts['kpis']==44 and counts['process_kpis']==44
payload={'organization_id':org,'batch_id':batch,'source_sha256':sha,'revision':revision,'source_as_of':package['source_as_of'],'source_url':package['source_url'],'package_status':package['status'],'items':items}
(out/'payload.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
report={'organization_id':org,'batch_id':batch,'source_sha256':sha,'revision':revision,'processes':44,'groups':len(groups),'owners':len(owners),'model_pdf_references':sum(d['type']=='BPMN2_PDF'for r in records for d in r['documents']),'counts':counts,'total_rows':len(items),'targets':0,'measurements':0,'bpmn_xml':0}
(out/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
