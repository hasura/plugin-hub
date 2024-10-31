import {profileData} from './profile-data.js'
import {Request, Response} from "express";
import {GraphQLRequest, handleError} from "../common/index.js";
import {ObjMap} from "./types.js";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {writeReportFile} from "../validate/write-report-file.js";
import {Span} from "@opentelemetry/api";

export const profilePlugin = async (req: Request, res: Response) => {

    const rawRequest: GraphQLRequest = req.body['rawRequest'];
    const session = req.body.session;
    const user = req.header("x-hasura-user");
    const profileFilename = req.header("profile-filename");
    const {response: {data}} = req.body;
    if (rawRequest.operationName == 'IntrospectionQuery' || !data || !profileFilename) {
        await res.json({status: 'ok'});
        return;
    }
    if (data) {
        await startActiveTrace("schema-validate", async (span?: Span) => {
            const profiling = profileData(data as ObjMap<unknown>)
            try {
                writeReportFile(undefined, undefined, rawRequest, undefined, profileFilename, user, session, profiling)
                res.json({status: 'ok'})
            } catch (_error) {
                const error = _error as Error;
                logger.error({user, session, request: rawRequest, error});
                handleError(res, error, session, rawRequest, user, span)
            }
        });
    }
}