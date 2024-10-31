import {Response} from "express";
import {GraphQLRequest} from "./graphql-request.js";
import {Span} from "@opentelemetry/api";
import {createSpanAttributes} from "./create-span-attributes.js";

export const handleError = (res: Response, error: Error, session: any, rawRequest: GraphQLRequest, user?: string, span?: Span) => {

    // Create and set span attributes
    const spanAttributes = createSpanAttributes(undefined, rawRequest, session, user);
    if (span) {
        span.setAttributes(spanAttributes);
    }

    res.json({fileOutputError: true});
    throw Error("File Output Error: " + error.message);
}