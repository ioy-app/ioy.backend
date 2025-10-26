import jwt from "jsonwebtoken";
import { DB, secret } from "../../../index.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

import CustomError from "../../customError.js";
import { genAccessToken } from "../../refresh.js";

export default async function Login(data, req, res) {
    if (!DB.connected)
        throw "Нет связи с базой данных";

    try {
        const result = await DB.query(`
            SELECT id, email, login FROM "users"
            WHERE 
            email=$1 AND
            active=true AND
            date_ban is NULL AND
            date_deleted is NULL
        `, [ data?.payload?.email ]);
        
        if (!result?.rows?.length)
            throw new CustomError("codes, login", "Такого пользователя не существует");

        const user = result?.rows?.at(0);
        
        const token = crypto.randomBytes(64).toString('hex');
        const hashedToken = await bcrypt.hash(token, 12);

        await DB.query(`
            INSERT INTO "refresh_tokens" (
                uid,
                user_agent,
                ip,
                token
            )
            VALUES (
                $1,
                $2,
                $3,
                $4
            )
        `, [ user.id, req.get("User-Agent"), req.ip, hashedToken ]);

        res.cookie('refresh_token', hashedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        const access_token = await genAccessToken(req, res, hashedToken);

        res.status(200).json({
            token: access_token,
            id: user.id,
            login: user.login
        });
    }
    catch(err) {
        if (err instanceof CustomError)
            throw err;

        console.error("[codes, login]", err.toString());
        throw "Неизвестная ошибка";
    }
}