import { secret } from "../../index.js";
import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";
import db from "@lib/db";
import { NextFunction, Response } from "express";
import Request from "@/types/request.js";
import AccessError from "@/utils/AccessError.js";
import getSession from "@/services/sessions/getSession.js";

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
    next && next();
}

const MiddlewareRequired = async (req: Request, res: Response, next: NextFunction) => {
    Middleware(req, res, next);

    if (!req.token)
        throw new AccessError("MiddlewareRequired", "errors.access.denied");

    const { id, refresh_id } = jwt.verify(req.token, secret) as JWTResponse;
    if (!id && !refresh_id)
        throw new AccessError("MiddlewareRequired", "errors.access.denied");

    const session = await getSession(id, refresh_id);

    req.user_id = id;
    req.is_access = true;
    req.refresh_id = refresh_id;

    next();
}

export {
    MiddlewareRequired,
    Middleware
}