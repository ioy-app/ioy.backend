import Request from "@/types/request";
import { Response } from "express";
import createToken from "@/services/sessions/createToken";
import AccessError from "@/utils/AccessError";

/**
 * Получение временного токена доступа
 * 
 * @param {Request} req
 * @param {Response} res 
*/
const updateSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = await createToken(req?.cookies?.refresh_token);
        res.status(200).json({ token });
    }
    catch(err) {
        if (err instanceof AccessError) {
            res.clearCookie("refresh_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
        }
        throw err;
    }
}

export default updateSession;