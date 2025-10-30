import { DB } from "../index.js";

export default async function Logout(req, res) {
    try {
        const result = await DB.query(`
            DELETE
            FROM "refresh_tokens"
            WHERE id=$1 AND uid=$2
            RETURNING 1
        `, [ req.refresh_id, req.user_id ]);

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).end();
    }
    catch(err) {
        console.error("[logout]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}