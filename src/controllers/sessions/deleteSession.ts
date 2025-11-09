import { Response } from "express";
import deleteSessionService from "@services/sessions/deleteSession";
import Request from "@/types/request";

/**
 * Удаление пользовательской сессии
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const deleteSession = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await deleteSessionService(Number(req.user_id), Number(id));
    res.status(200).end();
}

export default deleteSession;