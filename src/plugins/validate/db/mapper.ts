// src/plugins/validate/db/mapper.ts

import { ValidationRun } from './validation-run.entity.js'; // Import entity
import { ValidationError } from './validation-error.entity.js'; // Import entity
import { InputValidationResult, InputValidationError } from './types.js'; // Import interfaces

/**
 * Creates and populates ValidationRun and associated ValidationError entities
 * from the raw input JSON structure. Separated from entity definition to avoid circular deps.
 * @param input - The raw validation result JSON object.
 * @param sourceId - Optional identifier for the source of this data.
 * @returns A ValidationRun entity instance, ready to be saved.
 */
export function createValidationRunFromJson(input: InputValidationResult, sourceId?: string): ValidationRun {
    const run = new ValidationRun(); // Create instance

    // Map top-level fields
    run.source_identifier = sourceId ?? '';
    run.run_user = input.user ?? null; // Handle potential null from interface
    run.run_role = input.role;
    run.graphql_operation_name = input.operationName;
    run.graphql_query = input.query;

    // Map config flags if they were added to the entity & interface
    run.validation_config_data = input.$data ?? null;
    run.validation_config_verbose = input.verbose ?? null;
    run.validation_config_all_errors = input.allErrors ?? null;
    run.validation_config_strict = input.strict ?? null;

    // Stringify complex objects for TEXT/JSON storage
    run.validation_schema = input.jsonSchema ? JSON.stringify(input.jsonSchema) : ''; // Handle potentially undefined
    if (input.variables) {
        run.graphql_variables = typeof input.variables === 'string' ? input.variables : JSON.stringify(input.variables);
    } else {
        run.graphql_variables = null;
    }

    // Process and map errors
    run.errors = (input.errors || []).map((inputError: InputValidationError) => {
        const error = new ValidationError(); // Create instance
        error.instance_path = inputError.instancePath;
        error.schema_path = inputError.schemaPath;
        error.error_keyword = inputError.keyword;
        error.error_message = inputError.message ?? ''; // Handle potentially undefined message

        error.failed_data = inputError.data === null ? 'null' : String(inputError.data);

        error.error_params = JSON.stringify(inputError.params);
        error.error_schema_detail = JSON.stringify(inputError.schema);
        error.error_parent_schema_detail = inputError.parentSchema ? JSON.stringify(inputError.parentSchema) : null;

        // Link handled by TypeORM via run.errors assignment + cascade:true
        return error;
    });

    // Calculate total errors
    run.total_errors = run.errors.length;

    return run;
}