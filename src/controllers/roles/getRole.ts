import getRoleService from "@/services/roles/getRole";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Получение данных о роли
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const data = await getRoleService(Number(id));
    res.status(200).json(data);
}

export default getRole;