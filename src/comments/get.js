import { DB } from "../../index.js";
import CustomError from "../customError.js";

export default async function Get(req, res) {
    try {
        const { gameid } = req.params;
        const { offset, limit } = req.query;
        try {
            const result = await DB.query(`
                SELECT 
                    c.*,
                    jsonb_build_object(
                        'id', u.id,
                        'login', u.login
                    ) AS author,
                    COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'id', r.id,
                                'comment', r.comment,
                                'date_created', r.date_created,
                                'date_updated', r.date_updated,
                                'author', jsonb_build_object(
                                    'id', ru.id,
                                    'login', ru.login
                                ),
                                'deleted', r.deleted
                            )
                            ORDER BY r.date_created ASC
                        ) FILTER (WHERE r.id IS NOT NULL),
                        '[]'::jsonb
                    ) AS answers,
                    COUNT(*) OVER () AS total
                FROM comments c
                LEFT JOIN users u ON u.id = c.source_id
                LEFT JOIN comments r 
                    ON r.target_id = c.id 
                    AND r.target_type = 'comment'
                LEFT JOIN users ru ON ru.id = r.source_id
                WHERE 
                    c.target_id = $1 
                    AND c.target_type = 'game'
                GROUP BY c.id, u.id, u.login
                ORDER BY c.date_created DESC
                OFFSET $2 LIMIT $3
            `, [ gameid, offset || 0, limit || 3 ]);


            res.status(200).json(result?.rows);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[comments, get]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[comments, get]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}