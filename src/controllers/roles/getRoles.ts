import Request from "@/types/request";
import { Response } from "express";
import getRolesService from "@/services/roles/getRoles";

/**
 * Получение списка всех ролей
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getRoles = async (req: Request, res: Response): Promise<void> => {
    const { offset, limit } = req.query;

    const [ items, total ] = await getRolesService(Number(offset), Number(limit));
    const obj = {
        items,
        offset,
        limit,
        total
    }

    res.status(200).json(obj);
}

export default getRoles;