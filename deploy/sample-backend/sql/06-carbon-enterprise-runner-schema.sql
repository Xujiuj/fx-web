-- Schema-only work previously performed by CeSchemaMigrationRunner.
-- Derived from enterprise-backend commit 98d6eac06cfcd50877972c7b4f0ef46bd51b7971.
-- Keep this fail-fast baseline independent from the application's best-effort runner.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.ce_industry_classification', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ce_industry_classification (
        id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        industry_section_code NVARCHAR(32) NOT NULL,
        industry_section_name NVARCHAR(128) NOT NULL,
        industry_division_code NVARCHAR(32) NULL,
        industry_division_name NVARCHAR(128) NULL,
        industry_group_code NVARCHAR(32) NULL,
        industry_group_name NVARCHAR(128) NULL,
        industry_class_code NVARCHAR(32) NULL,
        industry_class_name NVARCHAR(128) NULL,
        sort_order INT NULL,
        status NVARCHAR(16) NULL,
        create_time DATETIME2 NULL CONSTRAINT df_ce_industry_classification_create_time DEFAULT SYSDATETIME(),
        update_time DATETIME2 NULL,
        remark NVARCHAR(500) NULL
    );
END;
GO

IF COL_LENGTH(N'dbo.ce_industry_classification', N'industry_path_key') IS NULL
BEGIN
    ALTER TABLE dbo.ce_industry_classification
        ADD industry_path_key AS (
            CONCAT(
                industry_section_code, N'|',
                ISNULL(industry_division_code, N''), N'|',
                ISNULL(industry_group_code, N''), N'|',
                ISNULL(industry_class_code, N'')
            )
        ) PERSISTED;
END;
GO

IF NOT EXISTS (
    SELECT 1
      FROM sys.key_constraints
     WHERE parent_object_id = OBJECT_ID(N'dbo.ce_industry_classification')
       AND name = N'uk_ce_industry_classification_path'
       AND type = N'UQ'
)
BEGIN
    ALTER TABLE dbo.ce_industry_classification
        ADD CONSTRAINT uk_ce_industry_classification_path UNIQUE (industry_path_key);
END;
GO

IF COL_LENGTH(N'dbo.ce_emission_source', N'source_unit') IS NULL
    ALTER TABLE dbo.ce_emission_source ADD source_unit NVARCHAR(64) NULL;
IF COL_LENGTH(N'dbo.ce_emission_source', N'factory_code') IS NULL
    ALTER TABLE dbo.ce_emission_source ADD factory_code NVARCHAR(64) NULL;
IF COL_LENGTH(N'dbo.ce_emission_source', N'data_frequency') IS NULL
    ALTER TABLE dbo.ce_emission_source ADD data_frequency NVARCHAR(16) NULL;
IF COL_LENGTH(N'dbo.ce_emission_source', N'responsible_user_id') IS NULL
    ALTER TABLE dbo.ce_emission_source ADD responsible_user_id BIGINT NULL;
IF COL_LENGTH(N'dbo.ce_emission_source', N'responsible_user_name') IS NULL
    ALTER TABLE dbo.ce_emission_source ADD responsible_user_name NVARCHAR(100) NULL;

IF COL_LENGTH(N'dbo.ce_activity_data', N'emission_source_id') IS NULL
    ALTER TABLE dbo.ce_activity_data ADD emission_source_id BIGINT NULL;
IF COL_LENGTH(N'dbo.ce_activity_data', N'activity_period') IS NULL
    ALTER TABLE dbo.ce_activity_data ADD activity_period NVARCHAR(32) NULL;
IF COL_LENGTH(N'dbo.ce_activity_data', N'factory_code') IS NULL
    ALTER TABLE dbo.ce_activity_data ADD factory_code NVARCHAR(64) NULL;

IF COL_LENGTH(N'dbo.ce_factor_cache_record', N'custom_fields') IS NULL
    ALTER TABLE dbo.ce_factor_cache_record ADD custom_fields NVARCHAR(MAX) NULL;
IF COL_LENGTH(N'dbo.ce_factor_cache_record', N'remark') IS NULL
    ALTER TABLE dbo.ce_factor_cache_record ADD remark NVARCHAR(500) NULL;
GO

SELECT N'carbon_enterprise_runner_schema_ok' AS result;
GO
