import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Subscribe(req, res) {
    try {
        const { id } = req?.params;
        if (!id)
            throw new CustomError("subscribe", "Не указана игра");
        
        try {
            const result = await DB.query(`
                WITH target_game AS (
                    SELECT id FROM "games" WHERE id = $2
                ),
                deleted AS (
                    DELETE FROM "subscribers"
                    WHERE source_id = $1
                    AND target_id = (SELECT id FROM target_game)
                    AND target_type = 'game'
                    RETURNING 'deleted' AS status
                ),
                inserted AS (
                    INSERT INTO "subscribers" (source_id, target_id, target_type)
                    SELECT $1, (SELECT id FROM target_game), 'game'
                    WHERE NOT EXISTS (SELECT 1 FROM deleted)
                    RETURNING 'created' AS status
                )
                SELECT status FROM deleted
                UNION ALL
                SELECT status FROM inserted;
            `, [ req.user_id, id ]);

            if (!result?.rows?.length)
                throw new CustomError("subscribe", "Игры не существует");

            res.status(200).json(result?.rows[0]);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[subscribe]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[subscribe]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}