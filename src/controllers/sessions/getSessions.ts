import { Response } from "express";
import getSessionsService from "@services/sessions/getSessions";
import Request from "@/types/request";

/**
 * Получение пользовательских сессий
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getSessions = async (req: Request, res: Response): Promise<void> => {
    const data = await getSessionsService(Number(req.user_id));
    res.status(200).json(data);
}

export default getSessions;