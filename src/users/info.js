import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";
import path from "path";
import fs from "fs";
import { genAccessToken } from "../refresh.js";

const work_dir = path.resolve("disk", "users");

export default async function Info(req, res) {
    try {
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const { login } = req.params;
        try {
            const result = await DB.query(`
                SELECT 
                    u.id,
                    u.login,
                    u.description,
                    u.date_deleted,
                    u.date_ban,
                    u.ban_count,
                    u.privacy,
                    COUNT(s.target_id) AS subscribers
                FROM "users" u
                LEFT JOIN "subscribers" s
                    ON s.target_id = u.id 
                    AND s.target_type = 'user'
                WHERE u.login = $1 AND u.active = true
                GROUP BY u.id
            `, [ login ]);

            if (!result?.rows?.length)
                throw new CustomError("info", "Пользователя не существует");

            const data = result?.rows[0];
            data.subscribers = parseInt(data.subscribers);

            if (token) {
                let info;
                try {
                    info = jwt.verify(token, secret);
                    
                }
                catch(err) {
                    try {
                        info = jwt.verify(await genAccessToken(req, res), secret);
                    }
                    catch(err) {
                        info = null;
                    }
                }
                finally {
                    if (info) {
                        const result = await DB.query(`
                            SELECT *
                            FROM "subscribers"
                            WHERE source_id = $1 AND target_id = $2 AND target_type = 'user'
                        `, [ info?.id, data?.id ]);

                        data.controls = {
                            is_subscribe: result?.rows?.length > 0,
                            is_me: data?.id == info?.id
                        }
                    } else {
                        data.controls = {
                            is_subscribe: false,
                            is_me: false
                        }
                    }
                    
                }
            }

            res.status(200).json(data);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            

            console.error("[info]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[info]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}

export async function GetAvatar(req, res) {
    try {
        const { login } = req.params;
        const user_dir = work_dir;
        const is_avatar = fs.existsSync(path.join(user_dir, `${login}.png`));

        if (!is_avatar)
            throw new CustomError("users, get avatar", "avatar is not exists");

        res.setHeader("Content-Type", "image/png");
        fs.createReadStream(path.join(user_dir, `${login}.png`)).pipe(res);
    }
    catch(err) {
        console.error("[users, avatar]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}