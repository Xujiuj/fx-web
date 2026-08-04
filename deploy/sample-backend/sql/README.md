# Sample SQL Server baseline

This directory creates the isolated `sample_fengxing` database used by the
public `/sample` enterprise demonstration. It is a fresh-install baseline, not
an upgrade path for the existing `/enterprise` service or any existing
database.

## Run

Run `sqlcmd` from this directory so its relative `:r` paths resolve correctly.
The administrator hash is mandatory and must be a 60-byte BCrypt hash encoded
as 120 hexadecimal characters.

```bash
sha256sum -c SHA256SUMS
sqlcmd -S <server> -U <user> -P <password> -d master -b \
  -v SAMPLE_ADMIN_PASSWORD_HASH_HEX=<120-hex-characters> \
  -i bootstrap.sql
sqlcmd -S <server> -U <user> -P <password> -d sample_fengxing -b \
  -i verify-schema.sql
```

`bootstrap.sql` refuses to run when `sample_fengxing` already exists. A failed
bootstrap may leave that dedicated database partially initialized; inspect the
reported error, remove only `sample_fengxing`, and rerun from a clean database.
Never rename the target to, or run this as an upgrade against, the production
enterprise database.

## Execution order

1. RuoYi-Vue-Plus 5.6.1 SQL Server base
2. Historical enterprise carbon schema
3. Dynamic-page module schema and menus
4. Current enterprise initialization and seed data
5. Current runtime repair
6. Schema-only DDL derived from `CeSchemaMigrationRunner`
7. Minimal `ce_dimension_edit_key` compatibility table
8. Fail-fast schema and seed verification

The completion SQL makes application-startup schema requirements explicit.
The application's runner catches and logs migration errors, so relying on it
would allow a broken database to appear to start successfully.

## Pinned sources

| Local file | Upstream source |
| --- | --- |
| `vendor/01-ruoyi-vue-plus-v5.6.1-sqlserver.sql` | `dromara/RuoYi-Vue-Plus` commit `6bfdcae06eaf218c4204382de277499be6c88c1b`, `script/sql/sqlserver/sqlserver_ry_vue_5.X.sql` |
| `vendor/02-carbon-enterprise-schema-v1.sql` | `Xujiuj/enterprise-backend` commit `043d3eed85be4561d7eed4e79a470586bbd40d86`, `script/sql/sqlserver/carbon_enterprise_schema_v1.sql` |
| `vendor/03-carbon-enterprise-dynamic-module.sql` | `Xujiuj/enterprise-backend` commit `98d6eac06cfcd50877972c7b4f0ef46bd51b7971`, `script/sql/sqlserver/carbon_enterprise_dynamic_module_20260713.sql` |
| `vendor/04-carbon-enterprise-init.sql` | `Xujiuj/enterprise-backend` commit `98d6eac06cfcd50877972c7b4f0ef46bd51b7971`, `script/sql/sqlserver/carbon_enterprise_init.sql` |
| `vendor/05-carbon-enterprise-runtime-repair.sql` | `Xujiuj/enterprise-backend` commit `98d6eac06cfcd50877972c7b4f0ef46bd51b7971`, `script/sql/sqlserver/carbon_enterprise_runtime_repair_20260628.sql` |

`06-carbon-enterprise-runner-schema.sql` is a reviewable SQL extraction of the
schema-only operations in `CeSchemaMigrationRunner` at enterprise commit
`98d6eac06cfcd50877972c7b4f0ef46bd51b7971`. It creates the industry table and
the ten columns otherwise added only during application startup.

The pinned source contains a read query for `ce_dimension_edit_key`, but no
authoritative DDL, constraint definition, or seed rows. The local compatibility
table therefore contains only the two required nullable columns. No invented
mapping seed is supplied.
