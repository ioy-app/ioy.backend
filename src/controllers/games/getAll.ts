import db from "@lib/db";
import path from "path";
import fs from "fs";
import CustomError from "../../utils/CustomError.js";

const work_dir = path.resolve("disk", "games");
const per_page = 25;

export default async function GetAll(req, res) {
    try {
        const page = parseInt(req?.query?.page) || 1;
        const result = await db.query(`
            SELECT 
                g.*,
                jsonb_agg(
                    jsonb_build_object(
                        'id', u.id,
                        'login', u.login
                    )
                ) AS authors_data
            FROM "games" g
            LEFT JOIN "users" u ON u.id = ANY(g.authors)
            GROUP BY g.id
            ORDER BY g.date_created DESC
            OFFSET $1 LIMIT $2
        `, [
            (page - 1) * per_page,
            per_page
        ]);

        if (!result?.rows?.length)
            throw new CustomError("games, get all", "game is not find");

        
       
        const games = result?.rows;
        for (const game of games) {
            const dir = path.join(work_dir, game?.id?.toString());
            game.is_avatar = fs.existsSync(path.join(dir, "icon.png"));
            game.is_game = fs.existsSync(path.join(dir, "index.html"));
        }
        const tags = await db.query(`
            SELECT
                tag,
                COUNT(*) AS usage_count
            FROM
                public.games,
                UNNEST(tags) AS tag
            WHERE
                tags IS NOT NULL
                AND array_length(tags, 1) > 0
            GROUP BY
                tag
            ORDER BY
                usage_count DESC, tag ASC
            LIMIT 8
        `);

        res.status(200).json({
            games,
            tags: tags.rows.map(item => item.tag)
        });
    }
    catch(err) {
        console.error("[games, get all]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}