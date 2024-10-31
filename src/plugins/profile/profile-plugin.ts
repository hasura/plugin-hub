import {profileData} from './profile-data.js'
import {Request, Response} from "express";
import {GraphQLRequest, handleError} from "../common/index.js";
import {ObjMap} from "./types.js";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {writeReportFile} from "../validate/write-report-file.js";
import {Span} from "@opentelemetry/api";

export const profilePlugin = async (req: Request, res: Response) => {

    const rawRequest: GraphQLRequest = req.body['rawRequest'];
    const { operationName, query, variables } = rawRequest;
    const profileFilename = req.header("profile-filename") || `${rawRequest.operationName}.json`;
    const {response: {data}} = req.body;
    if (operationName == 'IntrospectionQuery' || !data || !profileFilename) {
        await res.json({status: 'ok'});
        return;
    }
    const session = req.body.session;
    const user = req.header("x-hasura-user");
    await startActiveTrace("profile", async (span?: Span) => {
        const profiling = profileData(data as ObjMap<unknown>)
        span?.setAttributes({user, query, operationName: operationName || '', profileFilename, keys: Object.keys(data).join(",")})
        try {
            writeReportFile(undefined, undefined, rawRequest, undefined, profileFilename, user, session, profiling)
            await res.json({status: 'ok'})
        } catch (_error) {
            const error = _error as Error;
            logger.error({user, session, request: rawRequest, error});
            handleError(res, error, session, rawRequest, user, span)
        }
    });
}