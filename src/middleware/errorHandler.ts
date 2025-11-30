import jwt from "jsonwebtoken";
import CustomError from "@/utils/CustomError";
import ContentError from "@/utils/ContentError";
import ValidError from "@/utils/ValidError";

const errorHandler = (err, req, res, next) => {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).end("errors.jwt.expired");
    }

    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).end("errors.jwt.error");
    }

    if (err instanceof ContentError)
        return res.status(404).json({
            msg: err?.message.toString()
        });

    if (err instanceof CustomError) {
        return res.status(403).json({
            msg: err?.message
        })
    }

    if (err instanceof ValidError) {
        return res.status(422).json({
            msg: err?.message
        });
    }

    return res.status(422).json({
        msg: "Неизвестная ошибка"
    });

    return;
}

export default errorHandler;