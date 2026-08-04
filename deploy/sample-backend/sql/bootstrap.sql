:ON ERROR EXIT

-- Fresh-only sample baseline. Never point application upgrade automation at this file.
USE [master];
GO

-- Validate deployment input before creating any database state. The deployment
-- wrapper passes a 120-character hex encoding of a 60-byte BCrypt hash.
DECLARE @preflightAdminPasswordHex VARCHAR(120) = '$(SAMPLE_ADMIN_PASSWORD_HASH_HEX)';

IF LEN(@preflightAdminPasswordHex) <> 120
   OR @preflightAdminPasswordHex COLLATE Latin1_General_100_BIN2 LIKE '%[^0-9A-Fa-f]%'
    THROW 51000, 'SAMPLE_ADMIN_PASSWORD_HASH_HEX must contain exactly 120 hexadecimal characters.', 1;

DECLARE @preflightAdminPassword VARCHAR(60) =
    CONVERT(VARCHAR(60), CONVERT(VARBINARY(60), @preflightAdminPasswordHex, 2));

IF DATALENGTH(@preflightAdminPassword) <> 60
   OR LEFT(@preflightAdminPassword, 4) NOT IN ('$2a$', '$2b$', '$2y$')
   OR TRY_CONVERT(INT, SUBSTRING(@preflightAdminPassword, 5, 2)) NOT BETWEEN 4 AND 31
   OR SUBSTRING(@preflightAdminPassword, 7, 1) <> '$'
   OR @preflightAdminPassword COLLATE Latin1_General_100_BIN2 LIKE '%[^./0-9A-Za-z$]%'
    THROW 51000, 'Decoded administrator password is not a valid 60-character BCrypt hash.', 1;

IF DB_ID(N'sample_fengxing') IS NOT NULL
    THROW 51000, 'Refusing to bootstrap: database sample_fengxing already exists.', 1;
GO

CREATE DATABASE [sample_fengxing];
GO

USE [sample_fengxing];
GO

:r vendor/01-ruoyi-vue-plus-v5.6.1-sqlserver.sql
:r vendor/02-carbon-enterprise-schema-v1.sql
:r vendor/03-carbon-enterprise-dynamic-module.sql
:r vendor/04-carbon-enterprise-init.sql
:r vendor/05-carbon-enterprise-runtime-repair.sql
:r 06-carbon-enterprise-runner-schema.sql
:r 07-ce-dimension-edit-key.sql

-- Decode the already validated deployment value in this batch.
DECLARE @adminPasswordHex VARCHAR(120) = '$(SAMPLE_ADMIN_PASSWORD_HASH_HEX)';
DECLARE @adminPassword VARCHAR(60) =
    CONVERT(VARCHAR(60), CONVERT(VARBINARY(60), @adminPasswordHex, 2));

UPDATE dbo.sys_user
   SET password = @adminPassword,
       update_by = 1,
       update_time = SYSDATETIME(),
       remark = N'Bootstrap administrator; password supplied by deployment automation'
 WHERE tenant_id = N'000000'
   AND user_name = N'admin'
   AND del_flag = N'0';

IF @@ROWCOUNT <> 1
    THROW 51000, 'Expected exactly one enabled sample administrator row to update.', 1;
GO

:r verify-schema.sql
