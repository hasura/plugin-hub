import {GraphQLRequest} from "./graphql-request.js";
import {ErrorObject} from "ajv";
import {Attributes} from "@opentelemetry/api";

/**
 * Generates attributes for a span based on the provided JSON schema, GraphQL request, session, user, and errors.
 *
 * @param {string} jsonSchema - The JSON schema string.
 * @param {GraphQLRequest} rawRequest - The raw GraphQL request object.
 * @param {any} session - The session object containing role information.
 * @param {string} [user] - The user string (optional).
 * @param {ErrorObject[]} [errors] - An array of error objects (optional).
 * @param {number} [maxErrors] - Maximum number of errors to include in the attributes (optional).
 * @returns {Attributes} - The generated attributes for the span.
 */
export const createSpanAttributes = (jsonSchema?: string, rawRequest?: GraphQLRequest, session?: any,
                              user?: string, errors?: ErrorObject[], maxErrors?: number) => {
    const attributes: Attributes = {
        jsonSchema,
        user,
        role: session.role,
        query: rawRequest?.query,
        operationName: rawRequest?.operationName || '',
        variables: JSON.stringify(rawRequest?.variables)
    };
    if (errors) {
        errors.slice(0, maxErrors || 10).forEach((error) => {
            attributes[error.instancePath + '/rule'] = error.schemaPath;
            attributes[error.instancePath + '/error'] = error.parentSchema?.['description'] || error.message;
            attributes[error.instancePath + '/data'] = JSON.stringify(error.data);
        });
    }
    return attributes;
}