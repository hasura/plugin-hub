import {profileData} from './profile-data.js'
import {Request, Response} from "express";
import {createMD5Hash, GraphQLRequest, handleError, TMP, TMP_PROFILE_HISTORY} from "../common/index.js";
import {ObjMap} from "./types.js";
import {logger, startActiveTrace} from "../../telemetry/index.js";
import {writeReportFile} from "../validate/write-report-file.js";
import {Span} from "@opentelemetry/api";
import path from "path";
import fs from "fs";
import {v4} from 'uuid';


export const profilePlugin = async (req: Request, res: Response) => {

    const rawRequest: GraphQLRequest = req.body['rawRequest'];
    const { operationName, query } = rawRequest;
    const profileFilename = req.header("profile-filename") || `${rawRequest.operationName}.profile.json`;
    const trackHistory = req.header("profile-history") || process.env.PROFILE_HISTORY
    const {response: {data}} = req.body;
    if (operationName == 'IntrospectionQuery' || !data || !profileFilename) {
        await res.json({status: 'ok'});
        return;
    }
    const session = req.body.session;
    const user = req.header("x-hasura-user");
    await startActiveTrace("profile", async (span?: Span) => {
        span?.setAttributes({user, query, operationName: operationName || '', profileFilename, keys: Object.keys(data).join(",")})
        try {
            await res.json({status: 'ok'})
            setImmediate(() => {
                const profiling = profileData(data as ObjMap<unknown>)
                writeReportFile(undefined, undefined, rawRequest, undefined, path.join(TMP, profileFilename), user, session, profiling)
                if (trackHistory) {
                    setImmediate(() => {
                        const directory= path.join(TMP_PROFILE_HISTORY, createMD5Hash(query))
                        if (!fs.existsSync(directory)) {
                            fs.mkdirSync(directory);
                        }
                        writeReportFile(undefined, undefined, rawRequest, undefined, path.join(directory, `${v4()}.json`), user, session, profiling)
                    })
                }
            })
        } catch (_error) {
            const error = _error as Error;
            logger.error({user, session, request: rawRequest, error});
            handleError(res, error, session, rawRequest, user, span)
        }
    });
}