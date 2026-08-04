:ON ERROR EXIT

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;

IF DB_NAME() <> N'sample_fengxing'
    THROW 51000, 'Schema verification must run in the isolated sample_fengxing database.', 1;

DECLARE @RequiredTables TABLE (
    table_name SYSNAME NOT NULL PRIMARY KEY
);

INSERT INTO @RequiredTables (table_name)
VALUES
    (N'ce_activity_data'),
    (N'ce_admin_division'),
    (N'ce_base_year'),
    (N'ce_capture_batch'),
    (N'ce_capture_cell'),
    (N'ce_capture_row'),
    (N'ce_company_factory'),
    (N'ce_dimension_edit_key'),
    (N'ce_dynamic_field'),
    (N'ce_dynamic_module'),
    (N'ce_ef_factor'),
    (N'ce_electricity_factor'),
    (N'ce_electricity_factor_scope'),
    (N'ce_electricity_factor_version_map'),
    (N'ce_emission_source'),
    (N'ce_emission_source_category'),
    (N'ce_extension_field'),
    (N'ce_extension_field_value'),
    (N'ce_factor_cache_record'),
    (N'ce_factor_cache_version'),
    (N'ce_factor_confirmation'),
    (N'ce_fuel_factor_calc'),
    (N'ce_green_power_certificate'),
    (N'ce_greenhouse_gas'),
    (N'ce_industry_classification'),
    (N'ce_intensity_denominator_fact'),
    (N'ce_intensity_denominator_rule'),
    (N'ce_intensity_metric'),
    (N'ce_intensity_target'),
    (N'ce_intensity_tolerance'),
    (N'ce_license_state'),
    (N'ce_report_content'),
    (N'ce_report_setting'),
    (N'ce_report_template_file'),
    (N'ce_template_field'),
    (N'ce_template_sheet'),
    (N'ce_template_version'),
    (N'sys_dept'),
    (N'sys_menu'),
    (N'sys_role'),
    (N'sys_role_menu'),
    (N'sys_user');

IF (SELECT COUNT(*) FROM @RequiredTables) <> 42
    THROW 51000, 'Verifier manifest error: expected exactly 42 runtime dependency tables.', 1;

DECLARE @missing NVARCHAR(MAX);
DECLARE @message NVARCHAR(2048);

SELECT @missing = STUFF((
    SELECT N', ' + QUOTENAME(required_table.table_name)
      FROM @RequiredTables required_table
     WHERE OBJECT_ID(N'dbo.' + required_table.table_name, N'U') IS NULL
     ORDER BY required_table.table_name
       FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 2, N'');

IF NULLIF(@missing, N'') IS NOT NULL
BEGIN
    SET @message = N'Missing required runtime tables: ' + LEFT(@missing, 1800);
    THROW 51000, @message, 1;
END;

DECLARE @RequiredSupportTables TABLE (
    table_name SYSNAME NOT NULL PRIMARY KEY
);

INSERT INTO @RequiredSupportTables (table_name)
VALUES
    (N'sys_client'),
    (N'sys_config'),
    (N'sys_tenant'),
    (N'sys_user_role');

SELECT @missing = STUFF((
    SELECT N', ' + QUOTENAME(required_table.table_name)
      FROM @RequiredSupportTables required_table
     WHERE OBJECT_ID(N'dbo.' + required_table.table_name, N'U') IS NULL
     ORDER BY required_table.table_name
       FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 2, N'');

IF NULLIF(@missing, N'') IS NOT NULL
BEGIN
    SET @message = N'Missing bootstrap support tables: ' + LEFT(@missing, 1800);
    THROW 51000, @message, 1;
END;

-- Generated from the 27 @TableName entities in enterprise-backend commit
-- 98d6eac06cfcd50877972c7b4f0ef46bd51b7971.
DECLARE @RequiredEntityColumns TABLE (
    table_name SYSNAME NOT NULL,
    column_name SYSNAME NOT NULL,
    PRIMARY KEY (table_name, column_name)
);

INSERT INTO @RequiredEntityColumns (table_name, column_name)
VALUES
(N'ce_activity_data', N'activity_date'),
    (N'ce_activity_data', N'activity_month'),
    (N'ce_activity_data', N'activity_period'),
    (N'ce_activity_data', N'activity_unit'),
    (N'ce_activity_data', N'activity_value'),
    (N'ce_activity_data', N'activity_year'),
    (N'ce_activity_data', N'batch_id'),
    (N'ce_activity_data', N'calculated_emission'),
    (N'ce_activity_data', N'company_code'),
    (N'ce_activity_data', N'company_name'),
    (N'ce_activity_data', N'create_time'),
    (N'ce_activity_data', N'data_source'),
    (N'ce_activity_data', N'data_status'),
    (N'ce_activity_data', N'emission_source_id'),
    (N'ce_activity_data', N'emission_source_name'),
    (N'ce_activity_data', N'factor_key'),
    (N'ce_activity_data', N'factory_code'),
    (N'ce_activity_data', N'factory_name'),
    (N'ce_activity_data', N'id'),
    (N'ce_activity_data', N'remark'),
    (N'ce_activity_data', N'responsible_dept'),
    (N'ce_activity_data', N'scope_name'),
    (N'ce_activity_data', N'scope_subcategory'),
    (N'ce_activity_data', N'source_category_key'),
    (N'ce_activity_data', N'source_identification_code'),
    (N'ce_activity_data', N'source_identification_name'),
    (N'ce_activity_data', N'source_remark'),
    (N'ce_activity_data', N'source_sheet_code'),
    (N'ce_activity_data', N'update_time'),
    (N'ce_admin_division', N'create_time'),
    (N'ce_admin_division', N'division_code'),
    (N'ce_admin_division', N'division_name'),
    (N'ce_admin_division', N'id'),
    (N'ce_admin_division', N'level_type'),
    (N'ce_admin_division', N'parent_code'),
    (N'ce_admin_division', N'remark'),
    (N'ce_admin_division', N'sort_order'),
    (N'ce_admin_division', N'status'),
    (N'ce_admin_division', N'update_time'),
    (N'ce_base_year', N'base_year'),
    (N'ce_base_year', N'base_year_key'),
    (N'ce_base_year', N'create_time'),
    (N'ce_base_year', N'description'),
    (N'ce_base_year', N'enabled_flag'),
    (N'ce_base_year', N'factory_code'),
    (N'ce_base_year', N'factory_name'),
    (N'ce_base_year', N'id'),
    (N'ce_base_year', N'is_current'),
    (N'ce_base_year', N'remark'),
    (N'ce_base_year', N'sort_order'),
    (N'ce_base_year', N'status'),
    (N'ce_base_year', N'update_time'),
    (N'ce_capture_batch', N'batch_status'),
    (N'ce_capture_batch', N'create_time'),
    (N'ce_capture_batch', N'id'),
    (N'ce_capture_batch', N'module_code'),
    (N'ce_capture_batch', N'remark'),
    (N'ce_capture_batch', N'source_mode'),
    (N'ce_capture_batch', N'submitted_by'),
    (N'ce_capture_batch', N'submitted_time'),
    (N'ce_capture_batch', N'template_version_id'),
    (N'ce_capture_batch', N'update_time'),
    (N'ce_capture_batch', N'validation_status'),
    (N'ce_capture_cell', N'create_time'),
    (N'ce_capture_cell', N'date_value'),
    (N'ce_capture_cell', N'decimal_value'),
    (N'ce_capture_cell', N'field_id'),
    (N'ce_capture_cell', N'id'),
    (N'ce_capture_cell', N'row_id'),
    (N'ce_capture_cell', N'text_value'),
    (N'ce_capture_cell', N'update_time'),
    (N'ce_capture_cell', N'value_status'),
    (N'ce_capture_row', N'batch_id'),
    (N'ce_capture_row', N'create_time'),
    (N'ce_capture_row', N'id'),
    (N'ce_capture_row', N'row_status'),
    (N'ce_capture_row', N'sheet_id'),
    (N'ce_capture_row', N'source_row_no'),
    (N'ce_capture_row', N'update_time'),
    (N'ce_capture_row', N'validation_level'),
    (N'ce_company_factory', N'company_code'),
    (N'ce_company_factory', N'company_name'),
    (N'ce_company_factory', N'factory_code'),
    (N'ce_company_factory', N'factory_name'),
    (N'ce_company_factory', N'id'),
    (N'ce_company_factory', N'is_active'),
    (N'ce_electricity_factor', N'create_time'),
    (N'ce_electricity_factor', N'division_code'),
    (N'ce_electricity_factor', N'division_name'),
    (N'ce_electricity_factor', N'factor_version'),
    (N'ce_electricity_factor', N'id'),
    (N'ce_electricity_factor', N'national_factor'),
    (N'ce_electricity_factor', N'national_fossil_power_factor'),
    (N'ce_electricity_factor', N'non_fossil_excluded_factor'),
    (N'ce_electricity_factor', N'province_factor'),
    (N'ce_electricity_factor', N'region_factor'),
    (N'ce_electricity_factor', N'region_name'),
    (N'ce_electricity_factor', N'remark'),
    (N'ce_electricity_factor', N'sort_order'),
    (N'ce_electricity_factor', N'status'),
    (N'ce_electricity_factor', N'update_time'),
    (N'ce_electricity_factor', N'version_province_code'),
    (N'ce_electricity_factor_scope', N'create_time'),
    (N'ce_electricity_factor_scope', N'id'),
    (N'ce_electricity_factor_scope', N'remark'),
    (N'ce_electricity_factor_scope', N'scope_key'),
    (N'ce_electricity_factor_scope', N'scope_name'),
    (N'ce_electricity_factor_scope', N'sort_order'),
    (N'ce_electricity_factor_scope', N'status'),
    (N'ce_electricity_factor_scope', N'update_time'),
    (N'ce_electricity_factor_version_map', N'create_time'),
    (N'ce_electricity_factor_version_map', N'effective_year'),
    (N'ce_electricity_factor_version_map', N'factor_version'),
    (N'ce_electricity_factor_version_map', N'id'),
    (N'ce_electricity_factor_version_map', N'remark'),
    (N'ce_electricity_factor_version_map', N'sort_order'),
    (N'ce_electricity_factor_version_map', N'status'),
    (N'ce_electricity_factor_version_map', N'update_time'),
    (N'ce_emission_source', N'company_code'),
    (N'ce_emission_source', N'company_name'),
    (N'ce_emission_source', N'create_time'),
    (N'ce_emission_source', N'data_frequency'),
    (N'ce_emission_source', N'data_source'),
    (N'ce_emission_source', N'emission_source_name'),
    (N'ce_emission_source', N'enabled_flag'),
    (N'ce_emission_source', N'factor_key'),
    (N'ce_emission_source', N'factory_code'),
    (N'ce_emission_source', N'factory_name'),
    (N'ce_emission_source', N'id'),
    (N'ce_emission_source', N'remark'),
    (N'ce_emission_source', N'responsible_dept'),
    (N'ce_emission_source', N'responsible_user_id'),
    (N'ce_emission_source', N'responsible_user_name'),
    (N'ce_emission_source', N'scope_name'),
    (N'ce_emission_source', N'scope_subcategory'),
    (N'ce_emission_source', N'source_category_key'),
    (N'ce_emission_source', N'source_identification_code'),
    (N'ce_emission_source', N'source_identification_name'),
    (N'ce_emission_source', N'source_unit'),
    (N'ce_emission_source', N'update_time'),
    (N'ce_emission_source_category', N'business_key'),
    (N'ce_emission_source_category', N'category_name_en'),
    (N'ce_emission_source_category', N'category_sk'),
    (N'ce_emission_source_category', N'effective_date'),
    (N'ce_emission_source_category', N'expiry_date'),
    (N'ce_emission_source_category', N'gb_scope_category'),
    (N'ce_emission_source_category', N'gb_subcategory'),
    (N'ce_emission_source_category', N'ghg_scope'),
    (N'ce_emission_source_category', N'ghg_scope_category'),
    (N'ce_emission_source_category', N'ghg_scope_category_en'),
    (N'ce_emission_source_category', N'ghg_scope_category_sort'),
    (N'ce_emission_source_category', N'ghg_scope_en'),
    (N'ce_emission_source_category', N'id'),
    (N'ce_emission_source_category', N'is_current'),
    (N'ce_emission_source_category', N'iso_category'),
    (N'ce_emission_source_category', N'iso_category_description'),
    (N'ce_emission_source_category', N'iso_category_description_en'),
    (N'ce_emission_source_category', N'iso_category_en'),
    (N'ce_emission_source_category', N'iso_custom_subcategory'),
    (N'ce_emission_source_category', N'parent_code'),
    (N'ce_emission_source_category', N'remark'),
    (N'ce_emission_source_category', N'sort_order'),
    (N'ce_emission_source_category', N'status'),
    (N'ce_emission_source_category', N'unified_standard_category'),
    (N'ce_emission_source_category', N'version_no'),
    (N'ce_extension_field', N'create_time'),
    (N'ce_extension_field', N'enabled_flag'),
    (N'ce_extension_field', N'field_code'),
    (N'ce_extension_field', N'field_name'),
    (N'ce_extension_field', N'id'),
    (N'ce_extension_field', N'module_code'),
    (N'ce_extension_field', N'sheet_id'),
    (N'ce_extension_field', N'template_version_id'),
    (N'ce_extension_field', N'value_type'),
    (N'ce_extension_field_value', N'boolean_value'),
    (N'ce_extension_field_value', N'create_time'),
    (N'ce_extension_field_value', N'date_value'),
    (N'ce_extension_field_value', N'decimal_value'),
    (N'ce_extension_field_value', N'extension_field_id'),
    (N'ce_extension_field_value', N'id'),
    (N'ce_extension_field_value', N'owner_record_id'),
    (N'ce_extension_field_value', N'owner_table_code'),
    (N'ce_extension_field_value', N'text_value'),
    (N'ce_extension_field_value', N'update_time'),
    (N'ce_factor_cache_record', N'applicable_scope'),
    (N'ce_factor_cache_record', N'cache_version_id'),
    (N'ce_factor_cache_record', N'ch4'),
    (N'ce_factor_cache_record', N'co2'),
    (N'ce_factor_cache_record', N'co2_factor'),
    (N'ce_factor_cache_record', N'co2_factor_cv'),
    (N'ce_factor_cache_record', N'converted_factor'),
    (N'ce_factor_cache_record', N'custom_fields'),
    (N'ce_factor_cache_record', N'division_code'),
    (N'ce_factor_cache_record', N'division_name'),
    (N'ce_factor_cache_record', N'emission_source_name'),
    (N'ce_factor_cache_record', N'emission_source_name_en'),
    (N'ce_factor_cache_record', N'enabled_flag'),
    (N'ce_factor_cache_record', N'factor_category'),
    (N'ce_factor_cache_record', N'factor_code'),
    (N'ce_factor_cache_record', N'factor_gwp'),
    (N'ce_factor_cache_record', N'factor_key'),
    (N'ce_factor_cache_record', N'factor_name'),
    (N'ce_factor_cache_record', N'factor_source'),
    (N'ce_factor_cache_record', N'factor_table_code'),
    (N'ce_factor_cache_record', N'factor_unit'),
    (N'ce_factor_cache_record', N'factor_value'),
    (N'ce_factor_cache_record', N'factor_version'),
    (N'ce_factor_cache_record', N'fuel_level1'),
    (N'ce_factor_cache_record', N'fuel_level2'),
    (N'ce_factor_cache_record', N'fuel_level3'),
    (N'ce_factor_cache_record', N'fuel_level4'),
    (N'ce_factor_cache_record', N'fuel_material_category'),
    (N'ce_factor_cache_record', N'gwp_ch4'),
    (N'ce_factor_cache_record', N'gwp_hfcs'),
    (N'ce_factor_cache_record', N'gwp_n2o'),
    (N'ce_factor_cache_record', N'gwp_nf3'),
    (N'ce_factor_cache_record', N'gwp_pfcs'),
    (N'ce_factor_cache_record', N'gwp_sf6'),
    (N'ce_factor_cache_record', N'gwp_value'),
    (N'ce_factor_cache_record', N'hfcs'),
    (N'ce_factor_cache_record', N'id'),
    (N'ce_factor_cache_record', N'lower_heat_value'),
    (N'ce_factor_cache_record', N'lower_heat_value_cv'),
    (N'ce_factor_cache_record', N'n2o'),
    (N'ce_factor_cache_record', N'national_factor'),
    (N'ce_factor_cache_record', N'national_fossil_power_factor'),
    (N'ce_factor_cache_record', N'nf3'),
    (N'ce_factor_cache_record', N'non_fossil_excluded_factor'),
    (N'ce_factor_cache_record', N'pfcs'),
    (N'ce_factor_cache_record', N'province_factor'),
    (N'ce_factor_cache_record', N'region_factor'),
    (N'ce_factor_cache_record', N'region_name'),
    (N'ce_factor_cache_record', N'remark'),
    (N'ce_factor_cache_record', N'row_no'),
    (N'ce_factor_cache_record', N'sf6'),
    (N'ce_factor_cache_record', N'source_ref'),
    (N'ce_factor_cache_record', N'source_unit'),
    (N'ce_factor_cache_record', N'synced_time'),
    (N'ce_factor_cache_record', N'version_province_code'),
    (N'ce_factor_cache_version', N'frozen_flag'),
    (N'ce_factor_cache_version', N'id'),
    (N'ce_factor_cache_version', N'license_id'),
    (N'ce_factor_cache_version', N'synced_time'),
    (N'ce_factor_cache_version', N'vendor_version_id'),
    (N'ce_factor_cache_version', N'version_code'),
    (N'ce_factor_confirmation', N'confirmation_status'),
    (N'ce_factor_confirmation', N'confirmed_by'),
    (N'ce_factor_confirmation', N'confirmed_time'),
    (N'ce_factor_confirmation', N'create_time'),
    (N'ce_factor_confirmation', N'factor_code'),
    (N'ce_factor_confirmation', N'factor_name'),
    (N'ce_factor_confirmation', N'factor_unit'),
    (N'ce_factor_confirmation', N'factor_value'),
    (N'ce_factor_confirmation', N'factor_version_code'),
    (N'ce_factor_confirmation', N'id'),
    (N'ce_factor_confirmation', N'license_id'),
    (N'ce_factor_confirmation', N'remark'),
    (N'ce_factor_confirmation', N'update_time'),
    (N'ce_green_power_certificate', N'activity_month'),
    (N'ce_green_power_certificate', N'activity_year'),
    (N'ce_green_power_certificate', N'certificate_code'),
    (N'ce_green_power_certificate', N'create_time'),
    (N'ce_green_power_certificate', N'data_source'),
    (N'ce_green_power_certificate', N'electricity_type'),
    (N'ce_green_power_certificate', N'electricity_type_desc'),
    (N'ce_green_power_certificate', N'emission_source_name'),
    (N'ce_green_power_certificate', N'expiry_date'),
    (N'ce_green_power_certificate', N'factor_key'),
    (N'ce_green_power_certificate', N'factory_code'),
    (N'ce_green_power_certificate', N'factory_name'),
    (N'ce_green_power_certificate', N'id'),
    (N'ce_green_power_certificate', N'issuing_org'),
    (N'ce_green_power_certificate', N'offset_power_source'),
    (N'ce_green_power_certificate', N'power_grid_region'),
    (N'ce_green_power_certificate', N'proof_status'),
    (N'ce_green_power_certificate', N'purchase_date'),
    (N'ce_green_power_certificate', N'quantity_kwh'),
    (N'ce_green_power_certificate', N'remark'),
    (N'ce_green_power_certificate', N'scope_name'),
    (N'ce_green_power_certificate', N'scope_subcategory'),
    (N'ce_green_power_certificate', N'source_category_key'),
    (N'ce_green_power_certificate', N'source_remark'),
    (N'ce_green_power_certificate', N'update_time'),
    (N'ce_greenhouse_gas', N'chemical_formula'),
    (N'ce_greenhouse_gas', N'create_time'),
    (N'ce_greenhouse_gas', N'gas_code'),
    (N'ce_greenhouse_gas', N'gas_name'),
    (N'ce_greenhouse_gas', N'gas_name_en'),
    (N'ce_greenhouse_gas', N'gwp_value'),
    (N'ce_greenhouse_gas', N'gwp_version'),
    (N'ce_greenhouse_gas', N'id'),
    (N'ce_greenhouse_gas', N'remark'),
    (N'ce_greenhouse_gas', N'sort_order'),
    (N'ce_greenhouse_gas', N'status'),
    (N'ce_greenhouse_gas', N'update_time'),
    (N'ce_intensity_denominator_fact', N'batch_id'),
    (N'ce_intensity_denominator_fact', N'create_time'),
    (N'ce_intensity_denominator_fact', N'data_source'),
    (N'ce_intensity_denominator_fact', N'denominator_metric_name'),
    (N'ce_intensity_denominator_fact', N'denominator_type'),
    (N'ce_intensity_denominator_fact', N'denominator_value'),
    (N'ce_intensity_denominator_fact', N'fact_month'),
    (N'ce_intensity_denominator_fact', N'fact_year'),
    (N'ce_intensity_denominator_fact', N'factory_code'),
    (N'ce_intensity_denominator_fact', N'factory_name'),
    (N'ce_intensity_denominator_fact', N'factory_type'),
    (N'ce_intensity_denominator_fact', N'id'),
    (N'ce_intensity_denominator_fact', N'remark'),
    (N'ce_intensity_denominator_fact', N'source_sheet_code'),
    (N'ce_intensity_denominator_fact', N'unit_name'),
    (N'ce_intensity_denominator_fact', N'update_time'),
    (N'ce_intensity_metric', N'create_time'),
    (N'ce_intensity_metric', N'denominator_fact_id'),
    (N'ce_intensity_metric', N'denominator_unit'),
    (N'ce_intensity_metric', N'denominator_value'),
    (N'ce_intensity_metric', N'id'),
    (N'ce_intensity_metric', N'intensity_value'),
    (N'ce_intensity_metric', N'metric_code'),
    (N'ce_intensity_metric', N'metric_name'),
    (N'ce_intensity_metric', N'metric_period'),
    (N'ce_intensity_metric', N'metric_status'),
    (N'ce_intensity_metric', N'numerator_emission'),
    (N'ce_intensity_metric', N'remark'),
    (N'ce_intensity_metric', N'rule_code'),
    (N'ce_intensity_metric', N'target_code'),
    (N'ce_intensity_metric', N'update_time'),
    (N'ce_license_state', N'algorithm'),
    (N'ce_license_state', N'current_summary'),
    (N'ce_license_state', N'customer_id'),
    (N'ce_license_state', N'feature_codes'),
    (N'ce_license_state', N'id'),
    (N'ce_license_state', N'install_id'),
    (N'ce_license_state', N'key_id'),
    (N'ce_license_state', N'last_verified_time'),
    (N'ce_license_state', N'license_id'),
    (N'ce_license_state', N'license_status'),
    (N'ce_license_state', N'max_observed_time'),
    (N'ce_license_state', N'package_id'),
    (N'ce_license_state', N'package_name'),
    (N'ce_license_state', N'payload_digest'),
    (N'ce_license_state', N'schema_version'),
    (N'ce_license_state', N'valid_from'),
    (N'ce_license_state', N'valid_to'),
    (N'ce_report_content', N'chart_names'),
    (N'ce_report_content', N'create_time'),
    (N'ce_report_content', N'directory_name'),
    (N'ce_report_content', N'directory_no'),
    (N'ce_report_content', N'display_order'),
    (N'ce_report_content', N'id'),
    (N'ce_report_content', N'remark'),
    (N'ce_report_content', N'subdirectory_name'),
    (N'ce_report_content', N'subdirectory_no'),
    (N'ce_report_content', N'update_time'),
    (N'ce_report_template_file', N'create_time'),
    (N'ce_report_template_file', N'enabled_flag'),
    (N'ce_report_template_file', N'file_name'),
    (N'ce_report_template_file', N'file_path'),
    (N'ce_report_template_file', N'id'),
    (N'ce_report_template_file', N'remark'),
    (N'ce_report_template_file', N'template_code'),
    (N'ce_report_template_file', N'template_name'),
    (N'ce_report_template_file', N'template_type'),
    (N'ce_report_template_file', N'update_time'),
    (N'ce_template_field', N'business_field_code'),
    (N'ce_template_field', N'create_time'),
    (N'ce_template_field', N'extensible_flag'),
    (N'ce_template_field', N'field_order'),
    (N'ce_template_field', N'id'),
    (N'ce_template_field', N'original_field_flag'),
    (N'ce_template_field', N'original_field_name'),
    (N'ce_template_field', N'required_flag'),
    (N'ce_template_field', N'sheet_id'),
    (N'ce_template_field', N'value_type'),
    (N'ce_template_sheet', N'allow_extension'),
    (N'ce_template_sheet', N'create_time'),
    (N'ce_template_sheet', N'field_count'),
    (N'ce_template_sheet', N'header_row'),
    (N'ce_template_sheet', N'id'),
    (N'ce_template_sheet', N'module_code'),
    (N'ce_template_sheet', N'sheet_name'),
    (N'ce_template_sheet', N'sheet_type'),
    (N'ce_template_sheet', N'source_file'),
    (N'ce_template_sheet', N'source_group'),
    (N'ce_template_sheet', N'target_table_code'),
    (N'ce_template_sheet', N'template_version_id'),
    (N'ce_template_version', N'field_count'),
    (N'ce_template_version', N'id'),
    (N'ce_template_version', N'imported_by'),
    (N'ce_template_version', N'imported_time'),
    (N'ce_template_version', N'remark'),
    (N'ce_template_version', N'sheet_count'),
    (N'ce_template_version', N'source_dir'),
    (N'ce_template_version', N'status'),
    (N'ce_template_version', N'version_code'),
    (N'ce_template_version', N'version_name'),
    (N'ce_template_version', N'workbook_count');

IF (SELECT COUNT(*) FROM @RequiredEntityColumns) <> 396
    THROW 51000, 'Verifier manifest error: expected exactly 396 entity columns.', 1;

SELECT @missing = STUFF((
    SELECT N', ' + QUOTENAME(required_column.table_name) + N'.' + QUOTENAME(required_column.column_name)
      FROM @RequiredEntityColumns required_column
     WHERE NOT EXISTS (
         SELECT 1
           FROM sys.columns actual_column
          WHERE actual_column.object_id = OBJECT_ID(N'dbo.' + required_column.table_name)
            AND actual_column.name = required_column.column_name
     )
     ORDER BY required_column.table_name, required_column.column_name
       FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 2, N'');

IF NULLIF(@missing, N'') IS NOT NULL
BEGIN
    SET @message = N'Missing entity columns: ' + LEFT(@missing, 1800);
    THROW 51000, @message, 1;
END;

-- Non-entity DDL, dimension projections, bootstrap seeds, and direct mapper SQL.
DECLARE @RequiredRuntimeColumns TABLE (
    table_name SYSNAME NOT NULL,
    column_name SYSNAME NOT NULL,
    PRIMARY KEY (table_name, column_name)
);

INSERT INTO @RequiredRuntimeColumns (table_name, column_name)
VALUES
    (N'ce_company_factory', N'company_sk'),
    (N'ce_company_factory', N'create_time'),
    (N'ce_company_factory', N'effective_date'),
    (N'ce_company_factory', N'expiry_date'),
    (N'ce_company_factory', N'factory_type'),
    (N'ce_company_factory', N'industry_class_code'),
    (N'ce_company_factory', N'industry_class_name'),
    (N'ce_company_factory', N'industry_division_code'),
    (N'ce_company_factory', N'industry_division_name'),
    (N'ce_company_factory', N'industry_group_code'),
    (N'ce_company_factory', N'industry_group_name'),
    (N'ce_company_factory', N'industry_section_code'),
    (N'ce_company_factory', N'industry_section_name'),
    (N'ce_company_factory', N'province_code'),
    (N'ce_company_factory', N'province_name'),
    (N'ce_company_factory', N'remark'),
    (N'ce_company_factory', N'update_time'),
    (N'ce_dimension_edit_key', N'dimension_code'),
    (N'ce_dimension_edit_key', N'edit_key'),
    (N'ce_dynamic_field', N'db_column'),
    (N'ce_dynamic_field', N'field_code'),
    (N'ce_dynamic_field', N'field_name'),
    (N'ce_dynamic_field', N'form_visible_flag'),
    (N'ce_dynamic_field', N'id'),
    (N'ce_dynamic_field', N'list_visible_flag'),
    (N'ce_dynamic_field', N'max_length'),
    (N'ce_dynamic_field', N'module_id'),
    (N'ce_dynamic_field', N'numeric_precision'),
    (N'ce_dynamic_field', N'numeric_scale'),
    (N'ce_dynamic_field', N'required_flag'),
    (N'ce_dynamic_field', N'searchable_flag'),
    (N'ce_dynamic_field', N'sort_order'),
    (N'ce_dynamic_field', N'ui_type'),
    (N'ce_dynamic_field', N'value_type'),
    (N'ce_dynamic_module', N'create_by'),
    (N'ce_dynamic_module', N'create_time'),
    (N'ce_dynamic_module', N'id'),
    (N'ce_dynamic_module', N'menu_id'),
    (N'ce_dynamic_module', N'module_code'),
    (N'ce_dynamic_module', N'module_name'),
    (N'ce_dynamic_module', N'permission_prefix'),
    (N'ce_dynamic_module', N'sheet_name'),
    (N'ce_dynamic_module', N'status'),
    (N'ce_dynamic_module', N'table_name'),
    (N'ce_dynamic_module', N'update_by'),
    (N'ce_dynamic_module', N'update_time'),
    (N'ce_ef_factor', N'applicable_scope'),
    (N'ce_ef_factor', N'ch4'),
    (N'ce_ef_factor', N'co2'),
    (N'ce_ef_factor', N'create_time'),
    (N'ce_ef_factor', N'emission_source_name'),
    (N'ce_ef_factor', N'emission_source_name_en'),
    (N'ce_ef_factor', N'factor_gwp'),
    (N'ce_ef_factor', N'factor_sk'),
    (N'ce_ef_factor', N'factor_source'),
    (N'ce_ef_factor', N'factor_unit'),
    (N'ce_ef_factor', N'fuel_material_category'),
    (N'ce_ef_factor', N'gwp_ch4'),
    (N'ce_ef_factor', N'gwp_hfcs'),
    (N'ce_ef_factor', N'gwp_n2o'),
    (N'ce_ef_factor', N'gwp_nf3'),
    (N'ce_ef_factor', N'gwp_pfcs'),
    (N'ce_ef_factor', N'gwp_sf6'),
    (N'ce_ef_factor', N'hfcs'),
    (N'ce_ef_factor', N'id'),
    (N'ce_ef_factor', N'n2o'),
    (N'ce_ef_factor', N'nf3'),
    (N'ce_ef_factor', N'pfcs'),
    (N'ce_ef_factor', N'remark'),
    (N'ce_ef_factor', N'sf6'),
    (N'ce_ef_factor', N'source_unit'),
    (N'ce_ef_factor', N'update_time'),
    (N'ce_emission_source_category', N'create_time'),
    (N'ce_emission_source_category', N'update_time'),
    (N'ce_fuel_factor_calc', N'calc_key'),
    (N'ce_fuel_factor_calc', N'carbon_content'),
    (N'ce_fuel_factor_calc', N'carbon_content_unit'),
    (N'ce_fuel_factor_calc', N'co2_factor'),
    (N'ce_fuel_factor_calc', N'create_time'),
    (N'ce_fuel_factor_calc', N'effective_date'),
    (N'ce_fuel_factor_calc', N'enabled_flag'),
    (N'ce_fuel_factor_calc', N'expiry_date'),
    (N'ce_fuel_factor_calc', N'factor_source'),
    (N'ce_fuel_factor_calc', N'factor_unit'),
    (N'ce_fuel_factor_calc', N'fuel_material_category'),
    (N'ce_fuel_factor_calc', N'id'),
    (N'ce_fuel_factor_calc', N'lower_heat_value'),
    (N'ce_fuel_factor_calc', N'lower_heat_value_unit'),
    (N'ce_fuel_factor_calc', N'oxidation_rate'),
    (N'ce_fuel_factor_calc', N'remark'),
    (N'ce_fuel_factor_calc', N'update_time'),
    (N'ce_industry_classification', N'create_time'),
    (N'ce_industry_classification', N'id'),
    (N'ce_industry_classification', N'industry_class_code'),
    (N'ce_industry_classification', N'industry_class_name'),
    (N'ce_industry_classification', N'industry_division_code'),
    (N'ce_industry_classification', N'industry_division_name'),
    (N'ce_industry_classification', N'industry_group_code'),
    (N'ce_industry_classification', N'industry_group_name'),
    (N'ce_industry_classification', N'industry_path_key'),
    (N'ce_industry_classification', N'industry_section_code'),
    (N'ce_industry_classification', N'industry_section_name'),
    (N'ce_industry_classification', N'remark'),
    (N'ce_industry_classification', N'sort_order'),
    (N'ce_industry_classification', N'status'),
    (N'ce_industry_classification', N'update_time'),
    (N'ce_intensity_denominator_rule', N'create_time'),
    (N'ce_intensity_denominator_rule', N'denominator_metric_name'),
    (N'ce_intensity_denominator_rule', N'denominator_rule_key'),
    (N'ce_intensity_denominator_rule', N'denominator_type'),
    (N'ce_intensity_denominator_rule', N'enabled_flag'),
    (N'ce_intensity_denominator_rule', N'factory_type'),
    (N'ce_intensity_denominator_rule', N'id'),
    (N'ce_intensity_denominator_rule', N'intensity_unit_display'),
    (N'ce_intensity_denominator_rule', N'remark'),
    (N'ce_intensity_denominator_rule', N'update_time'),
    (N'ce_intensity_target', N'create_time'),
    (N'ce_intensity_target', N'factory_type'),
    (N'ce_intensity_target', N'id'),
    (N'ce_intensity_target', N'remark'),
    (N'ce_intensity_target', N'target_value'),
    (N'ce_intensity_target', N'target_year'),
    (N'ce_intensity_target', N'unit_name'),
    (N'ce_intensity_target', N'update_time'),
    (N'ce_intensity_tolerance', N'create_time'),
    (N'ce_intensity_tolerance', N'enabled_flag'),
    (N'ce_intensity_tolerance', N'id'),
    (N'ce_intensity_tolerance', N'industry_section'),
    (N'ce_intensity_tolerance', N'remark'),
    (N'ce_intensity_tolerance', N'tolerance_key'),
    (N'ce_intensity_tolerance', N'tolerance_rate'),
    (N'ce_intensity_tolerance', N'update_time'),
    (N'ce_report_setting', N'setting_key'),
    (N'ce_report_setting', N'setting_value'),
    (N'ce_report_setting', N'update_by'),
    (N'ce_report_setting', N'update_time'),
    (N'ce_template_field', N'target_column_code'),
    (N'sys_client', N'client_id'),
    (N'sys_client', N'del_flag'),
    (N'sys_client', N'status'),
    (N'sys_config', N'config_key'),
    (N'sys_config', N'config_value'),
    (N'sys_config', N'tenant_id'),
    (N'sys_dept', N'ancestors'),
    (N'sys_dept', N'create_by'),
    (N'sys_dept', N'create_dept'),
    (N'sys_dept', N'create_time'),
    (N'sys_dept', N'del_flag'),
    (N'sys_dept', N'dept_category'),
    (N'sys_dept', N'dept_id'),
    (N'sys_dept', N'dept_name'),
    (N'sys_dept', N'order_num'),
    (N'sys_dept', N'parent_id'),
    (N'sys_dept', N'status'),
    (N'sys_dept', N'tenant_id'),
    (N'sys_menu', N'component'),
    (N'sys_menu', N'menu_id'),
    (N'sys_menu', N'parent_id'),
    (N'sys_menu', N'path'),
    (N'sys_menu', N'status'),
    (N'sys_menu', N'visible'),
    (N'sys_role', N'del_flag'),
    (N'sys_role', N'role_id'),
    (N'sys_role', N'status'),
    (N'sys_role', N'tenant_id'),
    (N'sys_role_menu', N'menu_id'),
    (N'sys_role_menu', N'role_id'),
    (N'sys_tenant', N'del_flag'),
    (N'sys_tenant', N'status'),
    (N'sys_tenant', N'tenant_id'),
    (N'sys_user', N'del_flag'),
    (N'sys_user', N'password'),
    (N'sys_user', N'status'),
    (N'sys_user', N'tenant_id'),
    (N'sys_user', N'user_id'),
    (N'sys_user', N'user_name'),
    (N'sys_user_role', N'role_id'),
    (N'sys_user_role', N'user_id');

IF (SELECT COUNT(*) FROM @RequiredRuntimeColumns) <> 178
    THROW 51000, 'Verifier manifest error: runtime column manifest count changed unexpectedly.', 1;

SELECT @missing = STUFF((
    SELECT N', ' + QUOTENAME(required_column.table_name) + N'.' + QUOTENAME(required_column.column_name)
      FROM @RequiredRuntimeColumns required_column
     WHERE NOT EXISTS (
         SELECT 1
           FROM sys.columns actual_column
          WHERE actual_column.object_id = OBJECT_ID(N'dbo.' + required_column.table_name)
            AND actual_column.name = required_column.column_name
     )
     ORDER BY required_column.table_name, required_column.column_name
       FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 2, N'');

IF NULLIF(@missing, N'') IS NOT NULL
BEGIN
    SET @message = N'Missing runtime columns: ' + LEFT(@missing, 1800);
    THROW 51000, @message, 1;
END;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.ce_report_setting
     WHERE setting_key = N'powerbi.embedUrl'
       AND LTRIM(RTRIM(setting_value)) LIKE N'https://app.powerbi.com/view?%'
)
    THROW 51000, 'Missing public Power BI report setting powerbi.embedUrl.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_tenant
     WHERE tenant_id = N'000000'
       AND status = N'0'
       AND del_flag = N'0'
)
    THROW 51000, 'Missing enabled tenant 000000.', 1;

IF (
    SELECT COUNT(*)
      FROM dbo.sys_user
     WHERE tenant_id = N'000000'
       AND user_name = N'admin'
       AND status = N'0'
       AND del_flag = N'0'
) <> 1
    THROW 51000, 'Expected exactly one enabled tenant 000000 administrator.', 1;

IF EXISTS (
    SELECT 1
      FROM dbo.sys_user
     WHERE tenant_id = N'000000'
       AND user_name = N'admin'
       AND (
           password = N'$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2'
           OR LEN(password) <> 60
           OR LEFT(password, 4) NOT IN (N'$2a$', N'$2b$', N'$2y$')
       )
)
    THROW 51000, 'Sample administrator still has the upstream default or an invalid BCrypt hash.', 1;

IF (
    SELECT COUNT(*)
      FROM dbo.sys_role
     WHERE role_id IN (900001, 900002, 900003, 900004, 900005)
       AND tenant_id = N'000000'
       AND status = N'0'
       AND del_flag = N'0'
) <> 5
    THROW 51000, 'One or more required enterprise roles (900001-900005) are missing or disabled.', 1;

IF (
    SELECT COUNT(*)
      FROM dbo.sys_menu
     WHERE menu_id IN (900100, 900110, 900120, 900130, 900140, 900150, 900160, 900164)
       AND status = N'0'
) <> 8
    THROW 51000, 'One or more required enterprise menus are missing or disabled.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_menu
     WHERE menu_id = 900164
       AND path = N'powerbi-report'
       AND component = N'enterprise/reports/powerbi'
)
    THROW 51000, 'Power BI menu 900164 is not wired to the enterprise report component.', 1;

IF (
    SELECT COUNT(*)
      FROM dbo.sys_role_menu
     WHERE role_id = 900001
       AND menu_id IN (900100, 900110, 900120, 900130, 900140, 900150, 900160, 900164)
) <> 8
    THROW 51000, 'Enterprise administrator role is missing one or more key menu grants.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_user_role user_role
      JOIN dbo.sys_user app_user ON app_user.user_id = user_role.user_id
     WHERE app_user.tenant_id = N'000000'
       AND app_user.user_name = N'admin'
       AND app_user.del_flag = N'0'
       AND user_role.role_id = 900001
)
    THROW 51000, 'Sample administrator is not assigned enterprise administrator role 900001.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_config
     WHERE tenant_id = N'000000'
       AND config_key = N'sys.user.initPassword'
       AND NULLIF(LTRIM(RTRIM(config_value)), N'') IS NOT NULL
)
    THROW 51000, 'Missing sys.user.initPassword configuration.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_config
     WHERE tenant_id = N'000000'
       AND config_key = N'carbon.license.public-key-pem'
       AND LEN(LTRIM(RTRIM(config_value))) >= 256
)
    THROW 51000, 'Missing or invalid carbon.license.public-key-pem configuration.', 1;

IF NOT EXISTS (
    SELECT 1
      FROM dbo.sys_client
     WHERE client_id = N'e5cd7e4891bf95d1d19206ce24a7b32e'
       AND status = N'0'
       AND del_flag = N'0'
)
    THROW 51000, 'Missing enabled PC authentication client.', 1;

IF EXISTS (SELECT 1 FROM dbo.ce_license_state)
    THROW 51000, 'Fresh sample baseline must not contain imported license state.', 1;

SELECT
    N'sample_schema_verification_ok' AS result,
    42 AS required_table_count,
    396 AS entity_column_count,
    178 AS runtime_column_count;
