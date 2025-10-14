import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Post(req, res) {
    try {
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const { gameid } = req.params;
        try {
            const { id } = jwt.verify(token, secret);
            const { comment, answer_id } = req.body;

            if (!id)
                throw new CustomError("comments, post", "Нет авторизации");
            if (!comment)
                throw new CustomError("comments, post", "Пустое сообщение");

            const result = await DB.query(`
                INSERT INTO "comments" (
                    source_id,
                    target_id,
                    target_type,
                    comment
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )
                RETURNING id
            `, [ id, answer_id || gameid, answer_id ? "comment" : "game", comment ]);


            res.status(200).json({
                id: result.rows[0]?.id
            });
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[comments, post]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[comments, post]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}