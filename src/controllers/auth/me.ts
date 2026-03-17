import getUser from "@services/users/getUser";
import getUserLogin from "@services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";
import { getRole } from "@/services/roles";

/**
 * User info
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Me = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req;

    const login = await getUserLogin(Number(user_id));
    const data = await getUser(login);
    const roledata = await getRole(data.role_id);
    
    res.status(200).json({
        ...data,
        roledata
    });
}

export default Me;