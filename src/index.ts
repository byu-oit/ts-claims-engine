import Enforcer = require('openapi-enforcer-middleware');
import * as path from 'path';
import ClaimsAdjudicator from './engine/index';
import {UnidentifiedSubjectError, ValidationError} from './engine/types';
import {NextFunction, Request, Response} from 'express';

export default function (adjudicator: ClaimsAdjudicator) {
    const enforcer = new Enforcer(path.resolve(__dirname, './swagger.json'));
    enforcer.controllers({
        claims: async (req: Request, res: Response, next: NextFunction) => {
            const verified = await adjudicator.verifyClaims(req.body);

            const results = Object.entries(verified).reduce((acc, [key, result]) => {
                if (result instanceof ValidationError) {
                    return Object.assign(acc, {[key]: generateMetadataResponseObj(400)});
                }

                if (result instanceof UnidentifiedSubjectError) {
                    return Object.assign(acc, {[key]: generateMetadataResponseObj(404)});
                }

                const metadata = generateValidationResponseObj(200);
                return Object.assign(acc, {[key]: {verified: result, metadata}});
            }, {});

            return res.status(200).send(results);
        }
    });
    return enforcer.middleware();
}

function getResponseForReturnCode(code: number) {
    if (code === 200) {
        return 'Success';
    }
    if (code === 201) {
        return 'Created';
    }
    if (code === 204) {
        return 'No Content';
    }
    if (code === 400) {
        return 'Bad Request';
    }
    if (code === 401) {
        return 'Unauthorized';
    }
    if (code === 403) {
        return 'Forbidden';
    }
    if (code === 404) {
        return 'Not Found';
    }
    if (code === 409) {
        return 'Conflict';
    }
    if (code === 500) {
        return 'Internal Server Error';
    }
    return '';
}

function isObjEmpty(obj: any) {
    if (typeof obj !== 'object') {
        return true;
    }
    if (obj === null) {
        return true;
    }
    return (Object.keys(obj).length === 0);
}

function generateValidationResponseObj(code: number, message?: any) {
    if (code === undefined) {
        code = 200;
    }
    if ([200, 201, 204, 400, 401, 403, 404, 409].indexOf(code) === -1) {
        code = 409;
    }
    if (message === undefined) {
        message = getResponseForReturnCode(code);
    }
    if (typeof message === 'number') {
        message = message.toString();
    }
    if (typeof message === 'object' && message === null) {
        message = 'Response is null';
    }
    if (typeof message === 'object' && isObjEmpty(message)) {
        message = 'Response body is empty';
    }
    return {'validation_response': {'code': code, 'message': message}};
}

function generateMetadataResponseObj(code: number, message?: any) {
    return {'metadata': generateValidationResponseObj(code, message)};
}
