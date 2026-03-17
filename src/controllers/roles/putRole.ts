import Request from "@/types/request";
import { Response } from "express";
import putRoleService from "@/services/roles/putRole";

/**
 * Обновление данных о роли
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const putRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await putRoleService(Number(id), req.body);
    res.status(200).end();
}

export default putRole;