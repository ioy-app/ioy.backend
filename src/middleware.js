import { secret, DB } from "../index.js";
import CustomError from "./customError.js";
import jwt from "jsonwebtoken";

export default async function Middleware(req, res, next) {

}

export async function MiddlewareRequired(req, res, next) {
    try {
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token)
            throw new CustomError("middleware, required", "Нет доступа");

        const { id, refresh_id } = jwt.verify(token, secret);

        if (!id || !refresh_id)
            throw new CustomError("middleware, required", "Нет доступа");

        try {
            const result = await DB.query(`
                SELECT 1
                FROM "refresh_tokens"
                WHERE id=$1 AND uid=$2
            `, [ refresh_id, id ]);

            if (!result.rows.length)
                throw new CustomError("middleware, required", "Нет доступа");
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("db", err.toString());
            throw new CustomError("middleware, db", "Неизвестная ошибка");
        }

        req.user_id = id;
        req.is_access = true;
        req.refresh_id = refresh_id;

        next();
    }
    catch(err) {
        console.error("[middleware]", err.toString());

        let msg;
        if (err instanceof jwt.TokenExpiredError)
            msg = "Время жизни токена истекло";

        if (err instanceof jwt.JsonWebTokenError)
            msg = "Токен не действителен";

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
}