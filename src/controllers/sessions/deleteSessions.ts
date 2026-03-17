import { Response } from "express";
import deleteSessionsService from "@services/sessions/deleteSessions";
import Request from "@/types/request";

/**
 * Удаление всех пользовательских сессий
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const deleteSessions = async (req: Request, res: Response): Promise<void> => {
    await deleteSessionsService(Number(req.user_id));
    res.status(200).end();
}

export default deleteSessions;