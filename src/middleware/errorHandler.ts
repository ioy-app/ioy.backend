import jwt from "jsonwebtoken";
import CustomError from "@/utils/CustomError";
import ContentError from "@/utils/ContentError";

const errorHandler = (err, req, res, next) => {
    console.log(err);
    let msg;
    if (err instanceof jwt.TokenExpiredError)
        msg = "Время жизни токена истекло";

    if (err instanceof jwt.JsonWebTokenError)
        msg = "Токен не действителен";

    if (err instanceof ContentError)
        return res.status(404).json({
            msg: err?.message.toString()
        });

    if (err instanceof CustomError) {
        return res.status(403).json({
            msg: err?.message
        })
    }

    if (msg)
        return res.status(401).json({ msg });

    return res.status(422).json({
        msg: "Неизвестная ошибка"
    });
}

export default errorHandler;