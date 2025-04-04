import Ajv, {ValidateFunction, Options as AJVOptions} from "ajv";
import addFormats from 'ajv-formats'

/**
 * Creates a new Ajv validator instance based on the provided JSON schema and options.
 * @param {string} schema - A JSON string representing the schema to be compiled into a validator function.
 * @param {AJVOptions} options - Options object to configure the Ajv instance.
 * @returns {Function} A compiled validator function based on the provided schema.
 */
export const createAjvValidator = (schema: string, options: AJVOptions): ValidateFunction<unknown> => {
    const ajv = new (Ajv as any)(options);
    (addFormats as any)(ajv, {keywords: true});
    const schema_json: any = JSON.parse(schema)
    try {
        const ajv_compile = ajv.compile(schema_json)
        return ajv_compile;
    } catch(e) {
        console.log(e)
        throw e
    }
}