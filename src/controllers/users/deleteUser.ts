import { createCode } from "@/services/codes";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Delete user
 * @param req - Request
 * @param res - Response
*/
const deleteUser = async(req: Request, res: Response): Promise<void> => {
    try {
        const code = await createCode(req.user_id, { type: "delete_user", id: req.user_id });
        console.log(code);
    }
    finally { res.status(200).end(); }
}

export default deleteUser;