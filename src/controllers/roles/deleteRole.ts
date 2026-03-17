import Request from "@/types/request";
import { Response } from "express";
import deleteRoleServce from "@/services/roles/deleteRole";

/**
 * Удаление роли
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const deleteRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await deleteRoleServce(Number(id));

    res.status(200).end();
}

export default deleteRole;