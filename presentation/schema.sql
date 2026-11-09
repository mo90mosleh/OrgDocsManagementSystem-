CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE node_kind AS ENUM ('GROUP', 'PROCESS');
CREATE TYPE process_visibility AS ENUM ('ORGANIZATION', 'RESTRICTED');
CREATE TYPE process_classification AS ENUM ('CORE', 'MANAGEMENT', 'SUPPORT');
CREATE TABLE organizations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), singleton boolean NOT NULL DEFAULT true UNIQUE CHECK(singleton),
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 150), display_name text NOT NULL DEFAULT 'پرتال فرآیندها',
 logo_path text, primary_color text NOT NULL DEFAULT '#176b58' CHECK(primary_color ~ '^#[0-9a-fA-F]{6}$'), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
 username text NOT NULL UNIQUE CHECK(username = lower(username)), display_name text NOT NULL,
 password_hash text NOT NULL, role user_role NOT NULL, is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,id)
);
CREATE TABLE sessions (
 token_hash text PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid NOT NULL,
 expires_at timestamptz NOT NULL, FOREIGN KEY(organization_id,user_id) REFERENCES users(organization_id,id) ON DELETE CASCADE
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE auth_attempts (key text PRIMARY KEY, attempts integer NOT NULL, reset_at timestamptz NOT NULL);
CREATE TABLE org_units (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), parent_id uuid,
 name text NOT NULL, code text, sort_order integer NOT NULL DEFAULT 0, UNIQUE(organization_id,id), UNIQUE(organization_id,code),
 FOREIGN KEY(organization_id,parent_id) REFERENCES org_units(organization_id,id), CHECK(parent_id IS DISTINCT FROM id)
);
CREATE TABLE positions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), org_unit_id uuid NOT NULL,
 reports_to_position_id uuid, title text NOT NULL, UNIQUE(organization_id,id),
 FOREIGN KEY(organization_id,org_unit_id) REFERENCES org_units(organization_id,id),
 FOREIGN KEY(organization_id,reports_to_position_id) REFERENCES positions(organization_id,id), CHECK(reports_to_position_id IS DISTINCT FROM id)
);
CREATE TABLE persons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), display_name text NOT NULL,
 email text, phone text, UNIQUE(organization_id,id)
);
CREATE TABLE assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL, position_id uuid NOT NULL,
 FOREIGN KEY(organization_id,person_id) REFERENCES persons(organization_id,id), FOREIGN KEY(organization_id,position_id) REFERENCES positions(organization_id,id), UNIQUE(person_id,position_id)
);
CREATE TABLE process_nodes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), parent_id uuid,
 kind node_kind NOT NULL, classification process_classification, code text, name text NOT NULL, summary text, owner_org_unit_id uuid,
 visibility process_visibility NOT NULL DEFAULT 'ORGANIZATION', view_x double precision, view_y double precision,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,id), UNIQUE(organization_id,code), FOREIGN KEY(organization_id,parent_id) REFERENCES process_nodes(organization_id,id),
 FOREIGN KEY(organization_id,owner_org_unit_id) REFERENCES org_units(organization_id,id),
 CHECK(parent_id IS DISTINCT FROM id), CHECK(kind <> 'PROCESS' OR (code IS NOT NULL AND length(trim(code)) > 0))
);
CREATE TABLE process_permissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL, user_id uuid NOT NULL,
 can_view boolean NOT NULL DEFAULT false, can_edit boolean NOT NULL DEFAULT false, UNIQUE(process_id,user_id), CHECK(NOT can_edit OR can_view),
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id), FOREIGN KEY(organization_id,user_id) REFERENCES users(organization_id,id)
);
CREATE TABLE process_relations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), source_process_id uuid NOT NULL, target_process_id uuid NOT NULL,
 relation_type text NOT NULL CHECK(relation_type IN ('RELATED','PREREQUISITE','INPUT_FROM','OUTPUT_TO')), note text,
 FOREIGN KEY(organization_id,source_process_id) REFERENCES process_nodes(organization_id,id), FOREIGN KEY(organization_id,target_process_id) REFERENCES process_nodes(organization_id,id),
 CHECK(source_process_id <> target_process_id), UNIQUE(source_process_id,target_process_id,relation_type)
);
CREATE TABLE process_profiles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL UNIQUE,
 objective text, start_event text, end_event text, inputs text, outputs text, roles text, expected_outcome text, notes text,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id)
);
CREATE TABLE process_models (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL UNIQUE,
 bpmn_xml text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid NOT NULL,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id), FOREIGN KEY(organization_id,updated_by) REFERENCES users(organization_id,id)
);
CREATE TABLE bpms_references (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL,
 system_name text, workflow_code text, workflow_name text, url text, main_steps text, decision_rules text, kpi_events text, notes text,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id)
);
CREATE TABLE documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL,
 title text NOT NULL, doc_type text, file_path text, external_url text, mime_type text, uploaded_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id), FOREIGN KEY(organization_id,uploaded_by) REFERENCES users(organization_id,id)
);
CREATE TABLE raci_rows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL,
 activity_label text NOT NULL, role_label_or_position_id text, raci_type text NOT NULL CHECK(raci_type IN ('R','A','C','I')), note text,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id)
);
CREATE TABLE authority_rows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL,
 decision_subject text NOT NULL, role_label_or_position_id text, authority_type text, limit_or_condition text, notes text,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id)
);
CREATE TABLE kpis (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), code text NOT NULL, name text NOT NULL,
 description text, purpose text, formula_text text, numerator_text text, denominator_text text, unit text,
 preferred_direction text CHECK(preferred_direction IN ('HIGHER','LOWER','TARGET_RANGE')), frequency text, owner_person_id uuid,
 data_source text, breakdown_level text, target_value numeric, readiness_status text NOT NULL DEFAULT 'UNASSESSED' CHECK(readiness_status IN ('UNASSESSED','DEFINED','GAP','READY')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,id), UNIQUE(organization_id,code),
 FOREIGN KEY(organization_id,owner_person_id) REFERENCES persons(organization_id,id)
);
CREATE TABLE process_kpis (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), process_id uuid NOT NULL, kpi_id uuid NOT NULL,
 FOREIGN KEY(organization_id,process_id) REFERENCES process_nodes(organization_id,id), FOREIGN KEY(organization_id,kpi_id) REFERENCES kpis(organization_id,id), UNIQUE(process_id,kpi_id)
);
CREATE TABLE kpi_data_requirements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), kpi_id uuid NOT NULL,
 system_name text, entity_name text, field_or_event_name text, required_for text, availability_note text, is_available boolean,
 FOREIGN KEY(organization_id,kpi_id) REFERENCES kpis(organization_id,id)
);
CREATE TABLE kpi_measurements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), kpi_id uuid NOT NULL,
 period_start date NOT NULL, period_end date NOT NULL, actual_value numeric NOT NULL, note text, recorded_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,kpi_id) REFERENCES kpis(organization_id,id), FOREIGN KEY(organization_id,recorded_by) REFERENCES users(organization_id,id),
 CHECK(period_start <= period_end), UNIQUE(kpi_id,period_start,period_end)
);
