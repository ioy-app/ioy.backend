import deleteSession from "@services/sessions/deleteSession";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Logout
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Logout = async (req: Request, res: Response): Promise<void> => {
    await deleteSession(Number(req.user_id), Number(req.refresh_id));

    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).end();
}

export default Logout;