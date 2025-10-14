import { DB } from "../../index.js";
import path from "path";
import fs from "fs";
import CustomError from "../customError.js";

const work_dir = path.resolve("disk", "games");

export default async function Get(req, res) {
    try {
        const { id } = req.params;
        const result = await DB.query(`
            SELECT 
                g.*,
                jsonb_agg(
                    jsonb_build_object(
                        'id', u.id,
                        'login', u.login
                    )
                ) AS authors_data
            FROM "games" g
            JOIN "users" u ON u.id = ANY(g.authors)
            WHERE g.id = $1
            GROUP BY g.id;
        `, [ id ]);

        if (!result?.rows?.length)
            throw new CustomError("games, get", "game is not find");

        const game_dir = path.join(work_dir, id);
        const is_avatar = fs.existsSync(path.join(game_dir, "icon.png"));
        const is_game = fs.existsSync(path.join(game_dir, "index.html"));

        
        const recomendator = await DB.query(`
            WITH target AS (
                SELECT tags, authors
                FROM games
                WHERE id = $1
            ),
            candidates AS (
                SELECT 
                    g.*,
                    -- Определяем категории (булевы флаги)
                    (g.tags && t.tags) AS matches_tags,
                    (g.authors && t.authors) AS matches_authors,
                    (g.date_created >= NOW() - INTERVAL '30 days') AS is_new
                FROM games g
                CROSS JOIN target t
                WHERE g.id != $1
                AND (
                    g.tags && t.tags
                    OR g.authors && t.authors
                    OR g.date_created >= NOW() - INTERVAL '30 days'
                )
            ),
            -- Присваиваем каждой игре ОДНУ категорию с наивысшим приоритетом:
            -- 1 = теги, 2 = авторы, 3 = новые
            categorized AS (
                SELECT 
                    *,
                    CASE
                        WHEN matches_tags THEN 1
                        WHEN matches_authors THEN 2
                        WHEN is_new THEN 3
                        ELSE 4  -- не должно быть, но на всякий
                    END AS category
                FROM candidates
            ),
            -- Нумеруем внутри каждой категории
            numbered AS (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY category ORDER BY date_created DESC) AS rn
                FROM categorized
            ),
            -- Применяем лимиты по категориям
            filtered_by_limits AS (
                SELECT *
                FROM numbered
                WHERE 
                    (category = 1 AND rn <= 4) OR
                    (category = 2 AND rn <= 2) OR
                    (category = 3 AND rn <= 2)
            ),
            -- Теперь — просто берём до 8 лучших (по приоритету категории + дате)
            final AS (
                SELECT *
                FROM filtered_by_limits
                ORDER BY category, date_created DESC
                LIMIT 8
            )
            -- Если нужно — добавь JOIN с users для авторов, как в основном запросе
            SELECT id FROM final;         
        `, [ id ]);


        res.status(200).json({
            is_avatar,
            is_game,
            ...result.rows[0],
            recomendator: recomendator.rows
        });
    }
    catch(err) {
        console.error("[games, get]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}

export async function GetAvatar(req, res) {
    try {
        const { id } = req.params;
        const game_dir = path.join(work_dir, id);
        const is_avatar = fs.existsSync(path.join(game_dir, "icon.png"));

        if (!is_avatar)
            throw new CustomError("games, get avatar", "avatar is not exists");

        res.setHeader("Content-Type", "image/png");
        fs.createReadStream(path.join(game_dir, "icon.png")).pipe(res);
    }
    catch(err) {
        console.error("[games, get]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}

export async function GetGame(req, res) {
    try {
        const { id } = req.params;
        const game_dir = path.join(work_dir, id);
        const is_file = fs.existsSync(path.join(game_dir, "index.html"));

        if (!is_file)
            throw new CustomError("games, get game", "game is not exists");

        res.setHeader("Content-Type", "text/html");
        fs.createReadStream(path.join(game_dir, "index.html")).pipe(res);
    }
    catch(err) {
        console.error("[games, get]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}
export async function GetFiles(req, res) {
    try {
        const { file, id } = req.params;
        const game_dir = path.join(work_dir, id);
        const is_file = fs.existsSync(path.join(game_dir, file));

        if (!is_file)
            throw new CustomError("games, get file", "file is not exists");

        //res.setHeader("Content-Type", "text/html");
        fs.createReadStream(path.join(game_dir, file)).pipe(res);
    }
    catch(err) {
        console.error("[games, get file]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}