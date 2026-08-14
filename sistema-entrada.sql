--
-- PostgreSQL database dump
--

\restrict rhiH6llWjdlGdgM1J59c0EgKwPvqAvJppUAIyM7884aqWn3YMVGOZDMGPY6oVia

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdminRole" AS ENUM (
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public."AdminRole" OWNER TO postgres;

--
-- Name: KeyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KeyStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'INACTIVE'
);


ALTER TYPE public."KeyStatus" OWNER TO postgres;

--
-- Name: Movement; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Movement" AS ENUM (
    'ENTRY',
    'EXIT'
);


ALTER TYPE public."Movement" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: access_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_records (
    id text NOT NULL,
    person_id text NOT NULL,
    movement public."Movement" NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.access_records OWNER TO postgres;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    role public."AdminRole" DEFAULT 'ADMIN'::public."AdminRole" NOT NULL,
    must_change_password boolean DEFAULT true NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    admin_user_id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: key_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.key_assignments (
    id text NOT NULL,
    key_id text NOT NULL,
    person_id text NOT NULL,
    taken_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    returned_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.key_assignments OWNER TO postgres;

--
-- Name: keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keys (
    id text NOT NULL,
    name text NOT NULL,
    status public."KeyStatus" DEFAULT 'AVAILABLE'::public."KeyStatus" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.keys OWNER TO postgres;

--
-- Name: person_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person_types (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.person_types OWNER TO postgres;

--
-- Name: persons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persons (
    id text NOT NULL,
    full_name text NOT NULL,
    person_type_id text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.persons OWNER TO postgres;

--
-- Name: visit_hosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_hosts (
    id text NOT NULL,
    "position" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    employee_number text NOT NULL,
    full_name text NOT NULL,
    department text NOT NULL
);


ALTER TABLE public.visit_hosts OWNER TO postgres;

--
-- Name: visitor_access_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_access_records (
    id text NOT NULL,
    visitor_id text NOT NULL,
    movement public."Movement" NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.visitor_access_records OWNER TO postgres;

--
-- Name: visitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitors (
    id text NOT NULL,
    folio text NOT NULL,
    full_name text NOT NULL,
    company text NOT NULL,
    visit_to text NOT NULL,
    visit_host_id text,
    reason text NOT NULL,
    identification_type text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.visitors OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
896ca096-8c67-4744-b64d-3924d2e07b4b	1ac7a86dfa00860a34372f9f7d07796e9460fcc452981f3e9adb07b1833f94f1	2026-08-14 09:56:12.790742-06	20260814155612_init_coda_schema	\N	\N	2026-08-14 09:56:12.759192-06	1
f6ef3021-2695-441f-8555-f93f03f522e5	bfa907a93c725bae443bb48d48675738f5d2fc79d0e11d8ffbe01cd85594124d	2026-08-14 10:26:02.257044-06	20260814162602_add_roles_and_audit	\N	\N	2026-08-14 10:26:02.2401-06	1
d90be5ac-c11c-41bf-87b0-03f00b6325c4	d68ae7234f15fa5a45f0620e48a99015b62ef1bca0f01736578fe59a3137d0e5	2026-08-14 10:40:19.332313-06	20260814163943_add_name_must_change_password_to_admin_users	\N	\N	2026-08-14 10:40:19.327346-06	1
c771b6c7-9ec4-4c5a-a7f1-8f21db154c05	38ce68a2ff2edf984edde4c49953eeb3736d1f92f3e40dc62398ef6b3f71b135	\N	20260814173400_expand_visit_host	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260814173400_expand_visit_host\n\nDatabase error code: 42601\n\nDatabase error:\nERROR: syntax error at or near "﻿"\n\nPosition:\n[1m  0[0m\n[1m  1[1;31m ﻿-- ExpandVisitHost: reemplaza name/position? con employeeNumber, fullName, department, position[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42601), message: "syntax error at or near \\"\\u{feff}\\"", detail: None, hint: None, position: Some(Original(1)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("scan.l"), line: Some(1240), routine: Some("scanner_yyerror") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260814173400_expand_visit_host"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260814173400_expand_visit_host"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-08-14 11:35:52.840483-06	2026-08-14 11:35:21.863722-06	0
9341d1cd-91cb-477f-8151-b517f86e6f44	f18e4a5f81b309f68715c218f6b2db5e4a1585821c6ad3dae7e3e4ffa208b2ab	2026-08-14 11:35:59.265136-06	20260814173400_expand_visit_host	\N	\N	2026-08-14 11:35:59.245851-06	1
c5cbe4e9-8828-4b8c-9926-3adbc8bfc22e	7a043692980bd495b04d79ddf28506b6cbbcae330ef09393cbba8e432bb060ab	2026-08-14 12:01:06.367897-06	20260814180000_add_keys_and_assignments	\N	\N	2026-08-14 12:01:06.343719-06	1
\.


--
-- Data for Name: access_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_records (id, person_id, movement, "timestamp", created_at) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, email, password_hash, active, created_at, updated_at, role, must_change_password, name) FROM stdin;
cmst5uf1z0000p8kgll9grbnr	jose.hernandez@safe-demo.com	$2b$12$REwG6omy6Yv2nPt5IHFy7.XQOsxqKnkmfj041vrGpa.1iNPDaKPq.	t	2026-08-14 16:27:31.895	2026-08-14 16:50:35.487	SUPERADMIN	f	José Hernández
cmst4z2490005b4kg9nj1l8dl	admin@coda.local	$2b$12$jRTluv9d8Yf5JcF44l7mRe1VcUMAidLAmlprgWvvXcs9UoGjU8ZfW	f	2026-08-14 16:03:08.793	2026-08-14 16:50:43.985	ADMIN	t	Admin
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, admin_user_id, action, entity, entity_id, metadata, created_at) FROM stdin;
cmst6o2ne0000vckg81u7572q	cmst5uf1z0000p8kgll9grbnr	CHANGE_PASSWORD	AdminUser	cmst5uf1z0000p8kgll9grbnr	{"email": "jose.hernandez@safe-demo.com"}	2026-08-14 16:50:35.498
cmst6o9770001vckgx3t5m3eu	cmst5uf1z0000p8kgll9grbnr	DEACTIVATE_ADMIN	AdminUser	cmst4z2490005b4kg9nj1l8dl	{"name": "Admin", "email": "admin@coda.local"}	2026-08-14 16:50:43.987
\.


--
-- Data for Name: key_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.key_assignments (id, key_id, person_id, taken_at, returned_at, created_at) FROM stdin;
\.


--
-- Data for Name: keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keys (id, name, status, active, created_at, updated_at) FROM stdin;
cmst97pes000034kgihhfgw6f	Sala Agave	AVAILABLE	t	2026-08-14 18:01:50.692	2026-08-14 18:01:50.692
cmst97pew000134kg0uy9n7e9	Sala Mezquite	AVAILABLE	t	2026-08-14 18:01:50.696	2026-08-14 18:01:50.696
cmst97pey000234kgqe2ac81w	Sala Sotol	AVAILABLE	t	2026-08-14 18:01:50.698	2026-08-14 18:01:50.698
cmst97pez000334kgg9b17dhn	Sala Aant	AVAILABLE	t	2026-08-14 18:01:50.699	2026-08-14 18:01:50.699
cmst97pf1000434kgmqyiy58g	Sala Asakao	AVAILABLE	t	2026-08-14 18:01:50.701	2026-08-14 18:01:50.701
cmst97pf2000534kg5imqo2x1	Enfermería	AVAILABLE	t	2026-08-14 18:01:50.702	2026-08-14 18:01:50.702
\.


--
-- Data for Name: person_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person_types (id, name, slug, description, active, created_at, updated_at) FROM stdin;
cmst4z1yl0000b4kgxzo2f91h	Practicantes	practicantes	Estudiantes en práctica profesional	t	2026-08-14 16:03:08.589	2026-08-14 16:03:08.589
cmst4z1yp0001b4kga8hb1ct6	Seguridad	seguridad	Personal de seguridad	t	2026-08-14 16:03:08.593	2026-08-14 16:03:08.593
cmst4z1yr0002b4kg29adlehd	Limpieza	limpieza	Personal de limpieza e intendencia	t	2026-08-14 16:03:08.595	2026-08-14 16:03:08.595
cmst4z1ys0003b4kgsn5g836p	Médico	medico	Personal médico y de enfermería	t	2026-08-14 16:03:08.596	2026-08-14 16:03:08.596
\.


--
-- Data for Name: persons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.persons (id, full_name, person_type_id, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: visit_hosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_hosts (id, "position", active, created_at, updated_at, employee_number, full_name, department) FROM stdin;
cmst8d7lq00007okgababycmi	SUPV. MOLDEO/TURNO	t	2026-08-14 17:38:07.934	2026-08-14 17:43:04.276	1	MARQUEZ,CAMPOS, JESUS ARTURO	MOLDEO
cmst8d7lw00027okgm654kbe4	ANALISTA REC. HUMANOS	t	2026-08-14 17:38:07.94	2026-08-14 17:43:04.281	6	LOPEZ,DE LEON, NORA ELENA	RECURSOS HUMANOS
cmst8d7ly00037okgvqx4y4eg	TEC. MANTENIMIENTO	t	2026-08-14 17:38:07.942	2026-08-14 17:43:04.283	8	GALLEGOS,CHAVEZ, FRANCISCO JAVIER	MOLDEO
cmst8d7lz00047okgytczmu6s	SUPERVISOR DE LABORATORIO	t	2026-08-14 17:38:07.943	2026-08-14 17:43:04.284	16	DIAZ,RIVERA, JULIO CESAR	CALIDAD
cmst8d7m000057okgjield3oz	TEC. MANTENIMIENTO	t	2026-08-14 17:38:07.944	2026-08-14 17:43:04.285	25	MARTINEZ,MASCORRO, ANGEL JACOBO	MANTENIMIENTO
cmst8d7m200067okgrp752xi8	TEC. PROCESOS	t	2026-08-14 17:38:07.946	2026-08-14 17:43:04.286	29	NAÑEZ,GARCIA, OSCAR	MOLDEO
cmst8d7m300077okgkdz67udr	SUPV. MOLDES	t	2026-08-14 17:38:07.947	2026-08-14 17:43:04.287	32	SANTILLAN,RODRIGUEZ, JOSE GUADALUPE	MOLDES
cmst8d7m400087okgv9nf2ivl	INGENIERO DE FABRICACION Y DISEÑO	t	2026-08-14 17:38:07.948	2026-08-14 17:43:04.288	36	MORALES,GARCIA, LUIS ALONSO	INGENIERIA
cmst8d7m500097okgxmzna3w3	GERENTE DE NUEVOS PROYECTOS AMERICA	t	2026-08-14 17:38:07.949	2026-08-14 17:43:04.289	44	MARQUEZ,CONTRERAS, HECTOR HUGO	GERENCIA
cmst8d7m6000a7okgo3rw3pon	TEC. MANTENIMIENTO	t	2026-08-14 17:38:07.95	2026-08-14 17:43:04.291	51	ROMERO,ROMERO, CESAR	MANTENIMIENTO
cmst8d7m7000b7okgvzu59mxw	ERP Project Manager	t	2026-08-14 17:38:07.951	2026-08-14 17:43:04.292	54	DOMINGUEZ,ENRIQUEZ, VANESSA	GERENCIA
cmst8d7m8000c7okg9onronk0	CONTADOR	t	2026-08-14 17:38:07.952	2026-08-14 17:43:04.292	55	PLASENCIA,TREVIZO, ARACELY	FINANZAS
cmst8d7m9000d7okgfz7fxjwg	GERENTE GENERAL	t	2026-08-14 17:38:07.953	2026-08-14 17:43:04.294	59	ALEXANDRE,, ERIC FRANCIS	GERENCIA
cmst8d7ma000e7okg13enuw9h	GERENTE DE CALIDAD	t	2026-08-14 17:38:07.954	2026-08-14 17:43:04.295	66	VELICHCANICH,ARCINIEGA, JORGE IVAN	GERENCIA
cmst8d7mb000f7okgqo4lf6ja	COORDINADOR DE PROCESOS MOLDEO	t	2026-08-14 17:38:07.955	2026-08-14 17:43:04.296	67	ARZATE,MUÑOZ, JESUS ALFONSO	MOLDEO
cmst8d7mc000g7okgrrdu0cpx	INGENIERO DE PROCESOS	t	2026-08-14 17:38:07.956	2026-08-14 17:43:04.297	69	SOLIS,GONZALEZ, EDEN GERARDO	PINTURA
cmst8d7md000h7okgq288qmum	TECNICO DE PINTURA	t	2026-08-14 17:38:07.957	2026-08-14 17:43:04.298	77	CASTILLO,GILL, JOSE CORPUS	PINTURA
cmst8d7me000i7okgx5bbtk66	SUPERVISOR  DE CALIDAD	t	2026-08-14 17:38:07.958	2026-08-14 17:43:04.299	80	RONQUILLO,SIAS, PAUL	CALIDAD
cmst8d7mf000j7okgibde4xe5	CONTADOR SR.	t	2026-08-14 17:38:07.959	2026-08-14 17:43:04.3	83	VENZOR,GUTIERREZ, MIRNA SELENE	FINANZAS
cmst8d7mg000k7okg3tp0h82y	ADMINISTRADOR DE SISTEMAS	t	2026-08-14 17:38:07.96	2026-08-14 17:43:04.301	98	ROBLES,REYES, DANIEL	SISTEMAS
cmst8d7mh000l7okgz9bbebd2	SUPERVISOR DE PINTURA Y EN	t	2026-08-14 17:38:07.961	2026-08-14 17:43:04.302	103	ONTIVEROS,TORRES, LUIS CARLOS	PINTURA
cmst8d7mi000m7okggbsl9ilr	ADMINISTRADOR DE SISTEMAS	t	2026-08-14 17:38:07.962	2026-08-14 17:43:04.304	107	LOPEZ,GONZALEZ, VALENTE	SISTEMAS
cmst8d7mj000n7okg3dwixlwm	ENCARGADO (A) DE ADUANAS	t	2026-08-14 17:38:07.963	2026-08-14 17:43:04.305	110	QUINONEZ,ALDAZ, KYARA FERNANDA	FINANZAS
cmst8d7mk000o7okgn7j8tjeg	COORDINADOR DE PINTURA	t	2026-08-14 17:38:07.964	2026-08-14 17:43:04.306	112	MORALES,CHACON, DANIEL ARTURO	PINTURA
cmst8d7ml000p7okgs0mocrw3	COORDINADOR DE NUEVOS PROYECTOS	t	2026-08-14 17:38:07.965	2026-08-14 17:43:04.307	115	GARCIA,MIRAMONTES, AARON ABDON	INGENIERIA
cmst8d7mn000q7okgvsknt6o2	INGENIERO DE CALIDAD	t	2026-08-14 17:38:07.967	2026-08-14 17:43:04.308	139	CASTAÑEDA,SALAZAR, SUSANA	CALIDAD
cmst8d7mo000r7okg4s5golec	METROLOGISTA	t	2026-08-14 17:38:07.968	2026-08-14 17:43:04.309	143	ALVARADO,CARRERA, LUIS CARLOS	CALIDAD
cmst8d7mq000s7okgd839ypem	TEC. MOLDES	t	2026-08-14 17:38:07.97	2026-08-14 17:43:04.31	154	PARRA,LEYVA, JULIO FRANCISCO	MOLDES
cmst8d7mr000t7okgoco37mdn	SUPV. MANTENIMIENTO	t	2026-08-14 17:38:07.971	2026-08-14 17:43:04.311	157	HERRERA,TERAN, CESAR MANUEL	MANTENIMIENTO
cmst8d7ms000u7okgi9y9obdh	METROLOGISTA	t	2026-08-14 17:38:07.972	2026-08-14 17:43:04.312	159	JUAREZ,OCHOA, LUIS CARLOS	CALIDAD
cmst8d7mt000v7okg7x1el0yt	INGENIERO SEGURIDAD, HIGIENE & AMBIENTAL	t	2026-08-14 17:38:07.973	2026-08-14 17:43:04.313	166	BARRAGAN,CUEVAS, KAREN VANESA	RECURSOS HUMANOS
cmst8d7mu000w7okg4la9qhi2	ING. DE CALIDAD JR.	t	2026-08-14 17:38:07.974	2026-08-14 17:43:04.314	169	GUTIERREZ,ENRIQUEZ, ANHEL VANESSA	CALIDAD
cmst8d7mv000x7okghfsgm17h	GERENTE DE REC. HUMANOS	t	2026-08-14 17:38:07.975	2026-08-14 17:43:04.315	174	MELENDEZ,MANTILLA, IVETT	GERENCIA
cmst8d7mw000y7okgk7h6hna0	AUXILIAR CONTABLE	t	2026-08-14 17:38:07.976	2026-08-14 17:43:04.316	181	FUENTES,BONILLA, ARTURO	FINANZAS
cmst8d7my00107okgolv2cci8	ADMINISTRADOR DE SISTEMAS	t	2026-08-14 17:38:07.978	2026-08-14 17:43:04.318	187	OCHOA,PORTILLO, ROGER ALAN	SISTEMAS
cmst8d7mz00117okg82peu6mv	INGENIERO DE AUTOMATIZACIÓN	t	2026-08-14 17:38:07.979	2026-08-14 17:43:04.319	188	ARCIBA,CISNEROS, OSCAR ALBERTO	INGENIERIA
cmst8d7mz00127okggff9ylqv	TEC. MANTENIMIENTO	t	2026-08-14 17:38:07.979	2026-08-14 17:43:04.32	192	SALAS,NAVARRO, ARMANDO	MANTENIMIENTO
cmst8d7n000137okgq3bbd13u	ING. DE PROYECTOS	t	2026-08-14 17:38:07.98	2026-08-14 17:43:04.321	196	LOERA,MUÑOZ, ALEJANDRA	INGENIERIA
cmst8d7n100147okgz81rvmvu	TEC. MOLDES	t	2026-08-14 17:38:07.981	2026-08-14 17:43:04.322	197	TORRES,SOSA, MIGUEL ANGEL	MOLDES
cmst8d7n200157okgcdw5i16d	ASISTENTE DE LOGISTICA	t	2026-08-14 17:38:07.982	2026-08-14 17:43:04.323	198	VENZOR,SALCIDO, NICOLE ESTEFANIA	LOGISTICA
cmst8d7n300167okgafa8fqvp	TEC. MANTENIMIENTO	t	2026-08-14 17:38:07.983	2026-08-14 17:43:04.324	201	BETANCOURT,LOYA, JOSE LUIS	MANTENIMIENTO
cmst8d7n400177okguupq0pkq	SUPV. ALMACEN	t	2026-08-14 17:38:07.984	2026-08-14 17:43:04.325	202	DURAN,CORONADO, VICTOR MANUEL	LOGISTICA
cmst8d7n500187okgj89fh91q	INGENIERO DE CALIDAD	t	2026-08-14 17:38:07.985	2026-08-14 17:43:04.326	203	CANO,LANDAVERDE, VIRIDIANA	CALIDAD
cmst8d7n600197okg5d46a2mr	INGENIERO DE AUTOMATIZACIÓN	t	2026-08-14 17:38:07.986	2026-08-14 17:43:04.327	204	BARRAZA,RONQUILLO, CID ENRIQUE	INGENIERIA
cmst8d7n7001a7okg7tqunv7r	COORDINADOR DEL SISTEMA DE CALIDAD	t	2026-08-14 17:38:07.987	2026-08-14 17:43:04.328	205	IBARRA,GOMEZ, CLAUDIA YESENIA	CALIDAD
cmst8d7n8001b7okgk7p7gopz	TEC. PROCESOS	t	2026-08-14 17:38:07.988	2026-08-14 17:43:04.329	206	MERAZ,VELARDE, LUIS ALBERTO	MOLDEO
cmst8d7n9001c7okg23sjgruc	AUX.TRAFICO Y ADUANAS	t	2026-08-14 17:38:07.989	2026-08-14 17:43:04.329	207	DIEGO,DELGADO, EDUARDO	FINANZAS
cmst8d7na001d7okgud9hze1l	PLANNER	t	2026-08-14 17:38:07.99	2026-08-14 17:43:04.33	209	BAZALDUA,DOMINGUEZ, MARIA MARGARITA	LOGISTICA
cmst8d7nb001e7okg32df5b1v	COMPRADOR JR	t	2026-08-14 17:38:07.991	2026-08-14 17:43:04.332	210	CORRAL,GUTIERREZ, ALEXA	LOGISTICA
cmst8d7nc001f7okgltsmnbqb	ING. DE PROYECTOS	t	2026-08-14 17:38:07.992	2026-08-14 17:43:04.333	211	BILBAO,YAÑEZ, GABRIELA ALEXANDRA	INGENIERIA
cmst8d7nd001g7okgoncq687s	AUXILIAR DE PROCESOS DE MOLDEO	t	2026-08-14 17:38:07.993	2026-08-14 17:43:04.334	212	DE LA O,ZARATE, JESUS YAHIR	MOLDEO
cmst8d7ne001h7okgmov44i9y	GERENTE DE PRODUCCION	t	2026-08-14 17:38:07.994	2026-08-14 17:43:04.335	213	MORENO,VILLALOBOS, FERNANDO EZEQUIEL	GERENCIA
cmst8d7lv00017okgpo4cqr5g	SUPERVISOR DE PROCESOS DE MANUFACTURA	t	2026-08-14 17:38:07.939	2026-08-14 17:43:04.28	5	CASTRO,BELTRAN, RICARDO MARTIN	LEAN
cmst8d7mx000z7okgoqfd9tkl	GENERALISTA DE RECURSOS HUMANOS	t	2026-08-14 17:38:07.977	2026-08-14 17:43:04.317	182	RIVERA,OLIVAS, JESUS ALBERTO	RECURSOS HUMANOS
cmst8d7nf001i7okgvcji540w	CONTRALOR	t	2026-08-14 17:38:07.995	2026-08-14 17:43:04.336	214	LARA,CABADA, MARIA DOLORES	GERENCIA
cmst8d7nh001j7okg4d2ceflc	SUPV. MOLDEO/TURNO	t	2026-08-14 17:38:07.997	2026-08-14 17:43:04.337	215	HERNANDEZ,SOTELO, JULIO CESAR	MOLDEO
cmst8d7ni001k7okg05lktmvi	ING. PROGRAMADOR	t	2026-08-14 17:38:07.998	2026-08-14 17:43:04.338	216	HERNANDEZ,VAZQUEZ, JOSE DE JESUS	INGENIERIA
cmst8d7nj001l7okgp93x8452	INGENIERO DE CALIDAD	t	2026-08-14 17:38:07.999	2026-08-14 17:43:04.338	217	CASTAÑON,GARDEA, MELISSA	CALIDAD
cmst8d7nk001m7okgtfwxnwvt	GERENTE DE LOGISTICA	t	2026-08-14 17:38:08	2026-08-14 17:43:04.339	219	ORTIZ,GASTELUM, VICTOR GUADALUPE	GERENCIA
cmst8d7nl001n7okg0xrl5xh5	COMPRADOR MRO	t	2026-08-14 17:38:08.001	2026-08-14 17:43:04.34	220	LOPEZ,SALAZAR, YAGAMY NAOMY	LOGISTICA
cmst8d7nm001o7okg7t8ucv74	GESTOR DE TRAMITES Y RELACIONES PUBLICAS	t	2026-08-14 17:38:08.002	2026-08-14 17:43:04.341	221	MUÑOZ,, FRANCISCO JAVIER	RECURSOS HUMANOS
cmst8d7nn001p7okgthwa4p04	AUXILIAR CONTABLE	t	2026-08-14 17:38:08.003	2026-08-14 17:43:04.342	222	VIRAMONTES,LERMA, ANDREA	FINANZAS
cmst8d7no001q7okgnc9fhv2a	INGENIERO DE CALIDAD	t	2026-08-14 17:38:08.004	2026-08-14 17:43:04.343	223	ROMERO,CORDOVA, DANIELA	CALIDAD
cmst8d7np001r7okgfjedv7i9	ENFERMERA	t	2026-08-14 17:38:08.005	2026-08-14 17:43:04.344	225	GARCIA,MADRID, ALBA LILIA	RECURSOS HUMANOS
cmst8d7nq001s7okgdc7skb2s	SUPV. MOLDEO/TURNO	t	2026-08-14 17:38:08.006	2026-08-14 17:43:04.345	1003	LOPEZ,GARCIA, RAUL	MOLDEO
cmst8d7nr001t7okgjsd3kae5	TEC. MOLDES	t	2026-08-14 17:38:08.007	2026-08-14 17:43:04.346	1005	TOTO,MIRAVETE, GENARO	MOLDES
cmst8d7ns001u7okgknl4cqhh	TECNICO LEAN	t	2026-08-14 17:38:08.008	2026-08-14 17:43:04.347	1012	TOTO,MIRAVETE, ANTONIO	LEAN
cmst8d7nt001v7okghpv1anli	COORD. RQMS/CONTROL DE DOC  COORDINADOR	t	2026-08-14 17:38:08.009	2026-08-14 17:43:04.348	1014	REYES,RODRIGUEZ, MONICA IVONNE	CALIDAD
cmst8d7nu001w7okgs0q7jzaw	ENTRENADORA	t	2026-08-14 17:38:08.01	2026-08-14 17:43:04.349	1021	MARQUEZ,RIVAS, ROSA VELIA	RECURSOS HUMANOS
cmst8d7nv001x7okglnnnswdy	ANALISTA DE INVENTARIO	t	2026-08-14 17:38:08.011	2026-08-14 17:43:04.35	1036	CERRILLO,VARELA, ANGEL IVAN	LOGISTICA
cmst8d7nx001y7okgwb9r2d0w	TECNICO DE PINTURA	t	2026-08-14 17:38:08.013	2026-08-14 17:43:04.351	1310	PORRAS,GONZALEZ, RAUL ALBERTO	PINTURA
cmst8d7ny001z7okg7ppwe5vt	SUPERVISOR  DE CALIDAD	t	2026-08-14 17:38:08.014	2026-08-14 17:43:04.352	1436	PALMA,PEREZ, RODRIGO ELIAS	CALIDAD
cmst8d7nz00207okg39m7aktr	TECNICO DE PINTURA	t	2026-08-14 17:38:08.015	2026-08-14 17:43:04.353	1497	ESCARCEGA,DIAZ, ELISEO	PINTURA
cmst8d7o000217okgb884ccmy	TECNICO DE PINTURA	t	2026-08-14 17:38:08.016	2026-08-14 17:43:04.354	1586	GAMBOA,MORALES, ADRIAN	PINTURA
cmst8d7o100227okg64vultgc	SUPERVISOR DE PINTURA Y EN	t	2026-08-14 17:38:08.017	2026-08-14 17:43:04.354	2063	ROSAS,CISNEROS, LUIS ALBERTO	PINTURA
cmst8d7o100237okg0oyo61xj	TECNICO DE PINTURA	t	2026-08-14 17:38:08.018	2026-08-14 17:43:04.355	2198	HERRERA,RIOS, MIGUEL SALATIEL	PINTURA
cmst8d7o200247okg47znw9c7	TEC. PROCESOS	t	2026-08-14 17:38:08.018	2026-08-14 17:43:04.356	2969	ZAMARRON,CRUZ, DANIEL HABRAM	MOLDEO
cmst8d7o400257okgp03liti8	TECNICO DE PINTURA	t	2026-08-14 17:38:08.02	2026-08-14 17:43:04.357	3057	VILLAVERDE,HERNANDEZ, ISMAEL	PINTURA
cmst8d7o600267okgqy36eb40	LIDER DE CAPACITACION	t	2026-08-14 17:38:08.022	2026-08-14 17:43:04.358	3112	FLORES,ZAPATA, DEVANI MICHELLE	RECURSOS HUMANOS
cmst8d7o600277okgbr4hrl33	AUXILIAR CONTABLE	t	2026-08-14 17:38:08.023	2026-08-14 17:43:04.359	3113	HEREDIA,CARRAZCO, ANGEL ADRIAN	FINANZAS
\.


--
-- Data for Name: visitor_access_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_access_records (id, visitor_id, movement, "timestamp", created_at) FROM stdin;
\.


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitors (id, folio, full_name, company, visit_to, visit_host_id, reason, identification_type, created_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: access_records access_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_records
    ADD CONSTRAINT access_records_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: key_assignments key_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_assignments
    ADD CONSTRAINT key_assignments_pkey PRIMARY KEY (id);


--
-- Name: keys keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_pkey PRIMARY KEY (id);


--
-- Name: person_types person_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person_types
    ADD CONSTRAINT person_types_pkey PRIMARY KEY (id);


--
-- Name: persons persons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);


--
-- Name: visit_hosts visit_hosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_hosts
    ADD CONSTRAINT visit_hosts_pkey PRIMARY KEY (id);


--
-- Name: visitor_access_records visitor_access_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_access_records
    ADD CONSTRAINT visitor_access_records_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: access_records_movement_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX access_records_movement_idx ON public.access_records USING btree (movement);


--
-- Name: access_records_person_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX access_records_person_id_idx ON public.access_records USING btree (person_id);


--
-- Name: access_records_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX access_records_timestamp_idx ON public.access_records USING btree ("timestamp");


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_admin_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_admin_user_id_idx ON public.audit_logs USING btree (admin_user_id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_idx ON public.audit_logs USING btree (entity);


--
-- Name: key_assignments_key_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_assignments_key_id_idx ON public.key_assignments USING btree (key_id);


--
-- Name: key_assignments_key_id_returned_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_assignments_key_id_returned_at_idx ON public.key_assignments USING btree (key_id, returned_at);


--
-- Name: key_assignments_person_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_assignments_person_id_idx ON public.key_assignments USING btree (person_id);


--
-- Name: key_assignments_returned_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_assignments_returned_at_idx ON public.key_assignments USING btree (returned_at);


--
-- Name: key_assignments_taken_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_assignments_taken_at_idx ON public.key_assignments USING btree (taken_at);


--
-- Name: keys_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX keys_active_idx ON public.keys USING btree (active);


--
-- Name: keys_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX keys_name_key ON public.keys USING btree (name);


--
-- Name: keys_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX keys_status_idx ON public.keys USING btree (status);


--
-- Name: person_types_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX person_types_name_key ON public.person_types USING btree (name);


--
-- Name: person_types_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX person_types_slug_key ON public.person_types USING btree (slug);


--
-- Name: persons_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX persons_active_idx ON public.persons USING btree (active);


--
-- Name: persons_person_type_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX persons_person_type_id_idx ON public.persons USING btree (person_type_id);


--
-- Name: visit_hosts_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visit_hosts_active_idx ON public.visit_hosts USING btree (active);


--
-- Name: visit_hosts_department_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visit_hosts_department_idx ON public.visit_hosts USING btree (department);


--
-- Name: visit_hosts_employee_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX visit_hosts_employee_number_key ON public.visit_hosts USING btree (employee_number);


--
-- Name: visit_hosts_full_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visit_hosts_full_name_idx ON public.visit_hosts USING btree (full_name);


--
-- Name: visitor_access_records_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visitor_access_records_timestamp_idx ON public.visitor_access_records USING btree ("timestamp");


--
-- Name: visitor_access_records_visitor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visitor_access_records_visitor_id_idx ON public.visitor_access_records USING btree (visitor_id);


--
-- Name: visitors_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visitors_created_at_idx ON public.visitors USING btree (created_at);


--
-- Name: visitors_folio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visitors_folio_idx ON public.visitors USING btree (folio);


--
-- Name: visitors_folio_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX visitors_folio_key ON public.visitors USING btree (folio);


--
-- Name: access_records access_records_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_records
    ADD CONSTRAINT access_records_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.persons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: audit_logs audit_logs_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: key_assignments key_assignments_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_assignments
    ADD CONSTRAINT key_assignments_key_id_fkey FOREIGN KEY (key_id) REFERENCES public.keys(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: key_assignments key_assignments_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_assignments
    ADD CONSTRAINT key_assignments_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.persons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: persons persons_person_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_person_type_id_fkey FOREIGN KEY (person_type_id) REFERENCES public.person_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: visitor_access_records visitor_access_records_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_access_records
    ADD CONSTRAINT visitor_access_records_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.visitors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: visitors visitors_visit_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_visit_host_id_fkey FOREIGN KEY (visit_host_id) REFERENCES public.visit_hosts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict rhiH6llWjdlGdgM1J59c0EgKwPvqAvJppUAIyM7884aqWn3YMVGOZDMGPY6oVia

