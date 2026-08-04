:ON ERROR EXIT

SET NOCOUNT ON;
SET XACT_ABORT ON;
USE [master];

IF DB_ID(N'sample_fengxing') IS NULL
    THROW 51000, 'sample_fengxing must be bootstrapped before runtime configuration.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    IF SUSER_ID(N'sample_app') IS NULL
        CREATE LOGIN [sample_app]
            WITH PASSWORD = N'$(SAMPLE_DB_PASSWORD)',
                 DEFAULT_DATABASE = [sample_fengxing],
                 CHECK_POLICY = ON,
                 CHECK_EXPIRATION = OFF;
    ELSE
    BEGIN
        ALTER LOGIN [sample_app] ENABLE;
        ALTER LOGIN [sample_app] WITH DEFAULT_DATABASE = [sample_fengxing];
        ALTER LOGIN [sample_app] WITH PASSWORD = N'$(SAMPLE_DB_PASSWORD)';
    END;

    USE [sample_fengxing];

    IF DATABASE_PRINCIPAL_ID(N'sample_app') IS NULL
        CREATE USER [sample_app] FOR LOGIN [sample_app];
    ELSE
        ALTER USER [sample_app] WITH LOGIN = [sample_app];

    IF IS_ROLEMEMBER(N'db_owner', N'sample_app') <> 1
        ALTER ROLE [db_owner] ADD MEMBER [sample_app];

    UPDATE dbo.sys_oss_config
       SET status = N'1',
           update_by = 1,
           update_time = SYSDATETIME()
     WHERE status = N'0';

    UPDATE dbo.sys_oss_config
       SET config_key = N'minio',
           access_key = N'$(SAMPLE_MINIO_ROOT_USER)',
           secret_key = N'$(SAMPLE_MINIO_ROOT_PASSWORD)',
           bucket_name = N'$(SAMPLE_MINIO_BUCKET)',
           prefix = N'',
           endpoint = N'minio:9000',
           domain = N'https://fengxingzhicheng.com/sample-oss',
           is_https = N'N',
           region = N'',
           access_policy = N'2',
           status = N'0',
           update_by = 1,
           update_time = SYSDATETIME(),
           remark = N'Isolated sample MinIO; anonymous download with sandboxed public responses'
     WHERE oss_config_id = 1
       AND tenant_id = N'000000';

    IF @@ROWCOUNT <> 1
        THROW 51000, 'Expected exactly one sample MinIO configuration row.', 1;

    IF (SELECT COUNT(*) FROM dbo.sys_oss_config WHERE status = N'0') <> 1
        THROW 51000, 'Expected exactly one active OSS configuration.', 1;

    IF NOT EXISTS (
        SELECT 1
          FROM dbo.sys_oss_config
         WHERE oss_config_id = 1
           AND tenant_id = N'000000'
           AND config_key = N'minio'
           AND bucket_name = N'$(SAMPLE_MINIO_BUCKET)'
           AND endpoint = N'minio:9000'
           AND domain = N'https://fengxingzhicheng.com/sample-oss'
           AND access_policy = N'2'
           AND status = N'0'
    )
        THROW 51000, 'Sample MinIO runtime configuration verification failed.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT N'sample_runtime_configuration_ok' AS verification_marker;
GO
