import { secret, serviceUsers } from "../../index.js";
import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import Request from "@/types/request.js";
import AccessError from "@/utils/AccessError.js";
import dayjs from "dayjs";
import createToken from "@/services/sessions/createToken.js";
import promisegRPC from "@/utils/promisegRPC.js";

interface JWTResponse extends jwt.JwtPayload {
    /** ID */
    id: number;
    /** ID Токена */
    refresh_id: number;
}

const Middleware = async (req: Request, res: Response, next?: NextFunction) => {
    const authHeader: string = req?.headers?.authorization;
    let token: string = authHeader && authHeader.split(" ")[1] || req?.cookies?.refresh_token;

    if (!authHeader && req?.cookies?.refresh_token)
        token = await createToken(token);

    req.token = token;
    req.is_access = false;

    if (token) {
        try {
            const { id, refresh_id } = jwt.verify(token, secret) as JWTResponse;
            req.user_id = id;
            req.refresh_id = refresh_id;
            req.is_access = true;
        }
        catch(err) {
            console.log(err);
            req.is_access = false;
        }
    }

    next && next();
}

const MiddlewareRequired = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string = req?.headers?.authorization;
    let token: string = authHeader && authHeader.split(" ")[1] || req?.cookies?.refresh_token;

    if (!authHeader && req?.cookies?.refresh_token)
        token = await createToken(token);

    if (!token)
        throw new AccessError("MiddlewareRequired", "errors.denied");

    const { id, refresh_id } = jwt.verify(token, secret) as JWTResponse;

    if (!id && !refresh_id)
        throw new AccessError("MiddlewareRequired", "errors.denied");

    req.token = token;
    req.user_id = id;
    req.is_access = true;
    req.refresh_id = refresh_id;

    const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: id });
    const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
    if (userdata?.date_ban && dayjs(userdata?.date_ban).isAfter(dayjs())) {
        throw new AccessError("MiddlewareRequired", "errors.denied");
    }

    next();
}

export {
    MiddlewareRequired,
    Middleware
}
