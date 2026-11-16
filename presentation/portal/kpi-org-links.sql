create table public.kpi_org_links (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 kpi_id uuid not null,
 org_unit_id uuid,
 position_id uuid,
 check (num_nonnulls(org_unit_id,position_id)=1),
 foreign key (organization_id,kpi_id) references public.kpis(organization_id,id) on delete cascade,
 foreign key (organization_id,org_unit_id) references public.org_units(organization_id,id),
 foreign key (organization_id,position_id) references public.positions(organization_id,id)
);
create unique index kpi_org_links_unit_unique on public.kpi_org_links(kpi_id,org_unit_id) where org_unit_id is not null;
create unique index kpi_org_links_position_unique on public.kpi_org_links(kpi_id,position_id) where position_id is not null;
create index kpi_org_links_org on public.kpi_org_links(organization_id);
create index kpi_org_links_unit on public.kpi_org_links(organization_id,org_unit_id);
create index kpi_org_links_position on public.kpi_org_links(organization_id,position_id);
alter table public.kpi_org_links enable row level security;
grant select on public.kpi_org_links to anon,authenticated;
create policy kpi_org_links_visible on public.kpi_org_links for select to anon,authenticated
 using (exists(select 1 from public.kpis k where k.id=kpi_id and k.organization_id=kpi_org_links.organization_id));
