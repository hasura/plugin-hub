import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {ConsoleMetricExporter, MetricReader, PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor, type SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from './telemetry-init.js';

const createSDK = () => {
    const spanProcessors = [new SimpleSpanProcessor(new ConsoleSpanExporter() as SpanExporter) as any];
    const consoleMetricExporter = new ConsoleMetricExporter();
    let oltpMetricExports: OTLPMetricExporter | null = null;

    const otelExporterOltpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otelExporterOltpEndpoint != undefined) {
        const exporter = new OTLPTraceExporter({
            url: otelExporterOltpEndpoint + '/v1/traces'
        });
        const batchSpanProcessor = new BatchSpanProcessor(exporter);
        spanProcessors.push(batchSpanProcessor);
        oltpMetricExports = new OTLPMetricExporter({
            url: otelExporterOltpEndpoint + '/v1/metrics'
        });
    }

    const exporter = oltpMetricExports ?? consoleMetricExporter;
    return new NodeSDK({
        spanProcessors,
        metricReader: new PeriodicExportingMetricReader({exporter}) as any,
        autoDetectResources: true,
        instrumentations: registerInstrumentations(),
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
        }),
    });
};

export const sdk = createSDK();

// Shutdown handler
process.on('SIGTERM', () => {
    sdk.shutdown().then(
        () => {
            console.log('SDK shut down successfully');
        },
        (err: any) => {
            console.log('Error shutting down SDK', err);
        }
    ).finally(() => process.exit(0));
});