import {GraphQLRequest, TMP} from "../common/index.js";
import {Request, Response} from "express";
import {Span} from "@opentelemetry/api";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {writeReportFile} from "./write-report-file.js";
import {handleErrors} from "./handle-errors.js";
import {createAjvValidator} from "./create-ajv-validator.js";
import path from "path";

export type AJVOptions = {
    verbose: boolean;
    allErrors: boolean;
    strict: boolean;
}

export const validatePlugin = async (req: Request, res: Response) => {
    try {
        const rawRequest: GraphQLRequest = req.body['rawRequest'];
        const jsonSchema = req.header("json-schema");
        const { operationName, query, variables } = rawRequest;
        if (operationName == 'IntrospectionQuery' || !jsonSchema) {
            await res.json({status: 'ok'});
            return;
        }
        const session = req.body.session;
        const validateOptions = req.header("validate-options")?.toLowerCase();
        const user = req.header("x-hasura-user");
        const maxErrors = parseInt(req.header("max-validate-errors") || '10');
        const validateFilename = req.header("validate-filename") || `${rawRequest.operationName}.json`;

        const ajvOptions: AJVOptions = {
            verbose: validateOptions?.indexOf("verbose") !== -1,
            allErrors: validateOptions?.indexOf("allerrors") !== -1,
            strict: validateOptions?.indexOf("strict") !== -1
        }

        const log = validateOptions?.indexOf("log") !== -1;
        const {response: {data}} = req.body;

        await startActiveTrace("schema-validate", async (span?: Span) => {
            span?.setAttributes({jsonSchema, validateOptions, user, maxErrors, validateFilename, query, operationName: operationName || ''})
            const validator = createAjvValidator(jsonSchema, ajvOptions);
            validator({data});

            if (validateFilename) {
                writeReportFile(jsonSchema, ajvOptions, rawRequest, validator.errors || [], path.join(TMP, validateFilename), user, session);
            }

            if (validator.errors) {
                handleErrors(res, validator.errors, maxErrors, log, jsonSchema, session, rawRequest, user, span);
            } else {
                span?.setAttributes({"errors": "none"})
                await res.json({status: 'ok'})
            }
        });
    } catch (error) {
        logger.error(error);
    }
}

