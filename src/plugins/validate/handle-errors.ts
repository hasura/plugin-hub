import {Response} from "express";
import {ErrorObject} from "ajv";
import {Span} from "@opentelemetry/api";
import {logger} from "../../telemetry/index.js";
import {createSpanAttributes, GraphQLRequest} from "../common/index.js";

/**
 * Handles errors that occur during schema validation and provides options for logging and tracing.
 *
 * @param {Response} res - The response object to send the error JSON payload.
 * @param {ErrorObject[]} errors - Array of error objects containing validation errors.
 * @param {number} maxErrors - Maximum number of errors to process.
 * @param {boolean} log - Indicates whether to log the errors.
 * @param {string} jsonSchema - The JSON schema used for validation.
 * @param {any} session - The session or context object related to the request.
 * @param {GraphQLRequest} rawRequest - The raw GraphQL request object.
 * @param {string} [user] - Optional user identifier associated with the request.
 * @param {Span} [span] - Optional OpenTelemetry Span object for tracing.
 */
export const handleErrors = (res: Response, errors: ErrorObject[], maxErrors: number, log: boolean, jsonSchema: string,
                             session: any, rawRequest: GraphQLRequest, user?: string, span?: Span) => {
    if (log) {
        logger.error({jsonSchema, user, session, request: rawRequest, errors});
    }

    // Create and set span attributes
    const spanAttributes = createSpanAttributes(jsonSchema, rawRequest, session, user, errors, maxErrors);
    if (span) {
        span.setAttributes(spanAttributes);
    }

    res.json({validationErrors: true});
    throw Error("Schema Validation Error");
}