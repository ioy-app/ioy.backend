import Request from "@/types/request";
import { Response } from "express";
import { getRole } from "@/services/roles";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * User info
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Me = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req;

		const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id });
    const data = await promisegRPC(serviceUsers, "GetUser", { login });
    const roledata = await getRole(data.role_id);
    
    res.status(200).json({
        ...data,
        roledata
    });
}

export default Me;
