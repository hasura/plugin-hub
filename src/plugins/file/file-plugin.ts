import {FileFormat, FileOutput, outputFile} from './output-file.js';
import {Request, Response} from "express";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {Span} from "@opentelemetry/api";
import fs from "fs";
import path from "path";
import {GraphQLRequest, handleError, TMP} from "../common/index.js";
import * as aq from 'arquero';
import * as flat from 'flat';


/**
 * Handle file generation based on input data and requested format.
 * @param {Request} req - The request object containing data, headers, and session info.
 * @param {Response} res - The response object to send back file generation result.
 */
export const filePlugin = async (req: Request, res: Response) => {
    const rawRequest: GraphQLRequest = req.body['rawRequest'];
    if (rawRequest.operationName == 'IntrospectionQuery') {
        await res.json({status: 'ok'});
        return;
    }
    const {response: {data}} = req.body;
    const output = FileOutput.native;
    const format = req.header("file-format") as FileFormat;
    const filenameRoot = req.header("filename-root") || rawRequest.operationName;
    const session = req.body.session;
    const user = req.header("x-hasura-user");
    await startActiveTrace("file-output", async (span?: Span) => {
        try {
            if (data) {
                let i = 0;
                for (const entry of Object.entries(data)) {
                    const [key, dataset] = entry
                    if (Array.isArray(dataset) && format) {
                        let filename = "";
                        switch (format.toUpperCase()) {
                            case FileFormat.html:
                                filename = path.join(TMP, `${filenameRoot}-${key}.html`)
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](aq.from(dataset.map(i => flat.flatten(i))).toHTML(), format)
                                );
                                span?.setAttributes({'html': filename});
                                break
                            case FileFormat.markdown:
                                filename = path.join(TMP, `${filenameRoot}-${key}.md`);
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](aq.from(dataset.map(i => flat.flatten(i))).toMarkdown(), format)
                                );
                                span?.setAttributes({'markdown': filename});
                                break
                            case FileFormat.csv:
                                filename = path.join(TMP, `${filenameRoot}-${key}.csv`);
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](aq.from(dataset.map(i => flat.flatten(i))).toCSV(), format)
                                );
                                span?.setAttributes({'csv': filename});
                                break
                            case FileFormat.tsv:
                                filename = path.join(TMP, `${filenameRoot}-${key}.tsv`);
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](aq.from(dataset.map(i => flat.flatten(i))).toCSV({delimiter: '\t'}), format)
                                );
                                span?.setAttributes({'tsv': filename});
                                break;
                            case FileFormat.json:
                                filename = path.join(TMP, `${filenameRoot}-${key}.json`);
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](JSON.stringify(dataset, null, 2), format)
                                );
                                span?.setAttributes({'json': filename});
                                break;
                            case FileFormat.arrow:
                                filename = path.join(TMP, `${filenameRoot}-${key}.arrow`);
                                fs.writeFileSync(
                                    filename,
                                    outputFile[output](aq.from(dataset.map(i => flat.flatten(i))).toArrowIPC(), format)
                                );
                                span?.setAttributes({'arrow': filename});
                                break;
                            default:
                                if (i == 0) {
                                    i++;
                                    handleError(res, new Error("Invalid file format."), session, rawRequest, user, span)
                                }
                        }
                    }
                }
            }
            res.json({status: 'ok'})
        } catch (_error) {
            const error: Error = _error as Error;
            logger.error({user, session, request: rawRequest, error, format, filenameRoot});
            handleError(res, error, session, rawRequest, user, span)
        }
    });
}
