import type{Data,Process,Profile,KPI,Unit}from'../types';
export type EntityKind='process'|'kpi'|'unit'|'position'|'group';
export type EntityRef={kind:EntityKind;id:string};
export type AllowedNode=Pick<Process,'id'|'parent_id'|'kind'|'name'|'code'|'summary'|'classification'|'owner_org_unit_id'|'content_status'>;
export type AllowedData={organization:{id:string;name:string;display_name:string};nodes:AllowedNode[];profiles:Profile[];kpis:(KPI&{content_status?:string})[];units:Pick<Unit,'id'|'name'|'parent_id'>[];positions:{id:string;title:string;org_unit_id:string;parent_id:string|null}[];links:Data['links'];relations:NonNullable<Data['relations']>;documents:{id:string;title:string;process_id?:string;doc_type?:string;external_url?:string;content_status?:string}[];references:{process_id:string;main_steps:string;system_name:string;workflow_name:string}[]};
export type PageType='dashboard'|'chart'|'architecture'|'process-list'|'process'|'kpi-list'|'kpi'|'documents'|'login'|'admin'|'settings'|'unknown';
export type PageContext={path:string;pageType:PageType;title:string;entity:EntityRef|null;entityData:Record<string,unknown>|null;status:string;questions:string[];links:AssistantLink[];dataSource:'live'|'snapshot'|'unspecified'};
export type AssistantLink={label:string;href:string;external?:boolean;entity?:EntityRef};
export type Reply={paragraphs:string[];links:AssistantLink[];sources:AssistantLink[];navigate?:string;navigateEntity?:EntityRef;action?:'tour';clarify?:boolean};
