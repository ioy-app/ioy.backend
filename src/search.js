import { DB } from "../index.js";
import CustomError from "./customError.js";
const per_page = 20;

export default async function Search(req, res) {
    try {
        const page = parseInt(req?.query?.page) || 1;
        const search = req?.query?.search || "";

        const result = await DB.query(`
            (
                SELECT 
                    g.id, g.title, g.date_created, 'game' as type
                FROM games g
                WHERE
                    LOWER(g.title) LIKE $1
                LIMIT $2
            )
            UNION ALL
            (
                SELECT 
                    u.id, u.login as title, u.date_created, 'user' as type
                FROM users u
                WHERE
                    LOWER(u.login) LIKE $1
                LIMIT $2
            )
            ORDER BY date_created DESC
        `, [ `%${search}%`, per_page ]);

        res.status(200).json({
            content: result.rows || []
        });
    }
    catch(err) {
        console.error("[search]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}