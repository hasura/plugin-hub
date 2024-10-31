import Ajv, {ValidateFunction} from "ajv";
import addFormats from 'ajv-formats'
import {AJVOptions} from "./validate.js";

/**
 * Creates a new Ajv validator instance based on the provided JSON schema and options.
 * @param {string} schema - A JSON string representing the schema to be compiled into a validator function.
 * @param {AJVOptions} options - Options object to configure the Ajv instance.
 * @returns {Function} A compiled validator function based on the provided schema.
 */
export const createAjvValidator = (schema: string, options: AJVOptions): ValidateFunction<unknown> => {
    const ajv = new Ajv(options);
    addFormats(ajv);
    return ajv.compile(JSON.parse(schema));
}