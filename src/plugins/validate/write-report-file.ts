import {ErrorObject} from "ajv";
import fs from "fs";
import path from "path";
import {AJVOptions} from "./validate.js";
import {TMP, GraphQLRequest} from "../common/index.js";

/**
 * Generates a report file based on the provided parameters and writes it to a specified location.
 *
 * @param {string} jsonSchema - The JSON schema used for the report.
 * @param {AJVOptions} ajvOptions - Options for AJV validation.
 * @param {GraphQLRequest} rawRequest - The raw GraphQL request object.
 * @param {ErrorObject[]} errors - An array of error objects.
 * @param {string} filename - The name of the file to write the report to.
 * @param {string} [user] - The user associated with the report (optional).
 * @param {any} [session] - The session details associated with the report (optional).
 * @param profile
 */
export const writeReportFile = (jsonSchema?: string, ajvOptions?: AJVOptions, rawRequest?: GraphQLRequest,
                                errors?: ErrorObject[], filename?: string, user?: string, session?: any, profile?: any) => {
    if (filename) {
        const dataString = JSON.stringify({
            jsonSchema: jsonSchema ? JSON.parse(jsonSchema) : undefined,
            ...ajvOptions,
            user,
            role: session.role,
            query: rawRequest?.query,
            operationName: rawRequest?.operationName || '',
            variables: JSON.stringify(rawRequest?.variables),
            errors,
            profile
        }, null, 2);
        fs.writeFileSync(filename, dataString);
    }
}