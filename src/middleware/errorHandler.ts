import jwt from "jsonwebtoken";
import CustomError from "@/utils/CustomError";
import ContentError from "@/utils/ContentError";
import ValidError from "@/utils/ValidError";
import logger from "@/lib/logger";
import { NextFunction, Request, Response } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Express error", {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        error: err?.message,
        stack: err?.stack
    });
    if (err instanceof jwt.TokenExpiredError)
        return res.status(401).json({
            msg: "errors.jwt.expired"
        });

    if (err instanceof jwt.JsonWebTokenError)
        return res.status(401).json({
            msg: "errors.jwt.error"
        });

    if (err instanceof ContentError)
        return res.status(404).json({
            msg: err?.message.toString()
        });

    if (err instanceof CustomError) {
        return res.status(403).json({
            msg: err?.message?.toString()
        })
    }

    if (err instanceof ValidError) {
        return res.status(422).json({
            msg: err?.message?.toString()
        });
    }

    return res.status(500).json({
        msg: "errors.unknown"
    });
}

export default errorHandler;