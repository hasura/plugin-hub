import {GraphQLRequest, TMP} from "../common/index.js";
import {Request, Response} from "express";
import {Span} from "@opentelemetry/api";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {writeReportFile} from "./write-report-file.js";
import {handleErrors} from "./handle-errors.js";
import {createAjvValidator} from "./create-ajv-validator.js";
import path from "path";
import {Options as AJVOptions} from "ajv"
import {saveValidation} from "./db/save-validation.js";
import {AppDataSource} from "./db/data-source.js";

import {InputValidationResult} from "./db/types.js";

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
            $data: true,
            verbose: validateOptions ? validateOptions.indexOf("verbose") !== -1 : false,
            allErrors: validateOptions ? validateOptions.indexOf("allerrors") !== -1 : true,
            strict: validateOptions ? validateOptions.indexOf("strict") !== -1 : false
        }

        const log = validateOptions?.indexOf("log") !== -1;
        const {response: {data}} = req.body;

        await startActiveTrace("schema-validate", async (span?: Span) => {
            span?.setAttributes({jsonSchema, validateOptions, user, maxErrors, validateFilename, query, operationName: operationName || ''})
            const validator = createAjvValidator(jsonSchema, ajvOptions);
            validator({data});
            const filteredErrors = (validator.errors || []).filter(item => {
                return !(item.keyword === "if" && item.params?.failingKeyword === "then");
            });
            if (validateFilename) {
                writeReportFile(jsonSchema, ajvOptions, rawRequest, filteredErrors, path.join(TMP, validateFilename), user, session);
            }
            if (validateOptions?.indexOf("db") !== -1) {
                const dataString: InputValidationResult = {
                    jsonSchema: jsonSchema ? JSON.parse(jsonSchema) : undefined,
                    verbose: ajvOptions.verbose,
                    allErrors: ajvOptions.allErrors,
                    strict: ajvOptions.strict,
                    user,
                    role: session.role,
                    query: rawRequest?.query,
                    operationName: rawRequest?.operationName || '',
                    variables: JSON.stringify(rawRequest?.variables),
                    errors: filteredErrors as any[]
                } as InputValidationResult;
                await saveValidation(AppDataSource, dataString)
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

