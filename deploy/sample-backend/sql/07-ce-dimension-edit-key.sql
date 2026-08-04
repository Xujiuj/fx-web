-- Minimal compatibility table required by CeDimensionProjectionMapper.
-- The pinned source defines no authoritative rows or constraints for this table.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.ce_dimension_edit_key', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ce_dimension_edit_key (
        edit_key NVARCHAR(128) NULL,
        dimension_code NVARCHAR(64) NULL
    );
END;
GO

SELECT N'ce_dimension_edit_key_schema_ok' AS result;
GO
