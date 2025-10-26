import { DB, secret } from "../index.js";
import CustomError from "./customError.js";
import jwt from "jsonwebtoken";
const per_page = 20;

export default async function Refresh(req, res) {
    try {
        const token = await genAccessToken(req, res);
        console.log("Новый токен доступа")
        res.status(200).json({ token });
    }
    catch(err) {
        console.error("[refresh]", err.toString());

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(422).json({
            msg: err.toString()
        });
    }
}

export async function genAccessToken(req, res, temp_token) {
    const refresh_token = temp_token || req?.cookies?.refresh_token;
    if (!refresh_token)
        throw new CustomError("refresh", "Нет доступа");

    const result = await DB.query(`
        SELECT id, uid FROM "refresh_tokens"
        WHERE token=$1 AND NOW() < date_expires
    `, [ refresh_token ]);

    if (!result?.rows?.length) {
        throw new CustomError("refresh", "Нет доступа");
    }

    const token = jwt.sign({
        id: result.rows[0].uid,
        refresh_id: result.rows[0].id
    }, secret, {
        expiresIn: "5m"
    });

    return token;
}