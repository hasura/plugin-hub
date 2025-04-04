// Example in src/plugins/validate/db/save-validation.ts (or wherever you save)

import { DataSource } from 'typeorm';
// Import the INTERFACE from types.ts
import { InputValidationResult } from './types.js';
// Import the NEW MAPPING FUNCTION from mapper.ts
import { createValidationRunFromJson } from './mapper.js';
// Import the ENTITY for the repository
import { ValidationRun } from './validation-run.entity.js';


export async function saveValidation(dataSource: DataSource, inputJsonData: InputValidationResult) {
    try {
        // Ensure initialization only happens once if called multiple times
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log("Data Source has been initialized!");
        }

        console.log("Translating input JSON to entities using mapper function...");
        // Use the standalone mapping function
        const validationRunEntity = createValidationRunFromJson(inputJsonData, 'optional-source-id');

        console.log("Saving validation run and associated errors to database...");
        const runRepository = dataSource.getRepository(ValidationRun);
        const savedRun = await runRepository.save(validationRunEntity);

        console.log(`Successfully saved ValidationRun with ID: ${savedRun.validation_run_id} and ${savedRun.errors.length} errors.`);

    } catch (error) {
        console.error("Failed to process or save validation data:", error);
    } finally {
        // Decide on connection closing strategy - maybe not here if DataSource is shared
        // if (dataSource.isInitialized) {
        //     await dataSource.destroy();
        // }
    }
}

// Example call:
// import { AppDataSource } from './data-source';
// const inputJson = /* ... your input json object ... */;
// saveValidation(AppDataSource, inputJson as InputValidationResult);