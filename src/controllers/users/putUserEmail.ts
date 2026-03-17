import { createCode } from "@/services/codes";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Edit user mail
 * 
 * @param req - Request
 * @param res - Response
*/
const putUserEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { current_email, email } = req.body;
        const code = await createCode(req.user_id, {
            type: "change_email",
            current_email,
            email,
            user_id: req.user_id
        });
        console.log(code);   
    }
    finally { res.status(200).end(); }
}

export default putUserEmail;