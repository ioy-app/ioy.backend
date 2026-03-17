import { secret } from "../../index.js";
import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";
import db from "@lib/db";
import { NextFunction, Response } from "express";
import Request from "@/types/request.js";
import AccessError from "@/utils/AccessError.js";
import getSession from "@/services/sessions/getSession.js";
import getUserLogin from "@/services/users/getUserLogin.js";
import getUser from "@/services/users/getUser.js";
import dayjs from "dayjs";

interface JWTResponse extends jwt.JwtPayload {
    /** ID */
    id: number;
    /** ID Токена */
    refresh_id: number;
}

const Middleware = async (req: Request, res: Response, next?: NextFunction) => {
    const authHeader: string = req?.headers?.authorization;
    const token: string = authHeader && authHeader.split(" ")[1];

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
            req.is_access = false;
        }
    }

    next && next();
}

const MiddlewareRequired = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string = req?.headers?.authorization;
    const token: string = authHeader && authHeader.split(" ")[1];

    if (!token)
        throw new AccessError("MiddlewareRequired", "errors.denied");

    const { id, refresh_id } = jwt.verify(token, secret) as JWTResponse;

    if (!id && !refresh_id)
        throw new AccessError("MiddlewareRequired", "errors.denied");

    req.token = token;
    req.user_id = id;
    req.is_access = true;
    req.refresh_id = refresh_id;

    const login = await getUserLogin(id);
    const userdata = await getUser(login);
    if (userdata?.date_ban && dayjs(userdata?.date_ban).isAfter(dayjs())) {
        throw new AccessError("MiddlewareRequired", "errors.denied");
    }

    next();
}

export {
    MiddlewareRequired,
    Middleware
}