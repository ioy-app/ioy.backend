import db from "@lib/db";
import CustomError from "../../utils/CustomError.js";

export default async function Post(req, res) {
    try {
        const { gameid } = req.params;
        if (!gameid)
            throw new CustomError("comments, post", "Не указан id игры");
        try {
            const { comment, answer_id } = req.body;
            if (!comment)
                throw new CustomError("comments, post", "Пустое сообщение");

            const result = await db.query(`
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
            `, [ req.user_id, answer_id || gameid, answer_id ? "comment" : "game", comment ]);


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