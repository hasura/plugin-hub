import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

// Initialize diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Register instrumentations before any other imports
export const registerInstrumentations = () => {
    const grpcInstrumentation = new GrpcInstrumentation();
    const httpInstrumentation = new HttpInstrumentation();
    const winstonInstrumentation = new WinstonInstrumentation({
        logHook: (_, record) => {
            record['resource.service.name'] = process.env.OTEL_SERVICE_NAME;
        },
    });
    const expressInstrumentation = new ExpressInstrumentation();

    return [
        grpcInstrumentation,
        httpInstrumentation,
        winstonInstrumentation,
        expressInstrumentation,
    ];
};