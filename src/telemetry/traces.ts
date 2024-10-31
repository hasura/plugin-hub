import type {Attributes, Span} from "@opentelemetry/api";
import {SpanStatusCode, trace} from "@opentelemetry/api";

import {logger} from "./logger.js";

export const spanError = (span: Span, error: Error): void => {
    logger.error(error);
    span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
    })
}
export const spanOK = (span: Span, attributes?: Attributes): void => {
    if (attributes) {
        span.setAttributes(attributes)
    }
    span.setStatus({code: SpanStatusCode.OK})
}
export const startActiveTrace = <T>(name: string, fn: (span?: Span) => Promise<T>): T => {
    return trace.getTracer(process.env.OTEL_SERVICE_NAME ?? 'hasura-plugin-hub', '1').startActiveSpan(name.split('/').pop() ?? 'unknown', async (span) => {
        try {
            const result = await fn(span)
            spanOK(span)
            return result
        } catch (error) {
            spanError(span, error as Error)
        } finally {
            span.end()
        }
    }) as T
}