import putUserEmail from "@/services/users/putUserEmail";
import ContentError from "@/utils/ContentError";
import { Request, Response } from "express";

/**
 * Change email
 * 
 * @param {any} payload - Payload data
 * @param {Request} req - Request 
 * @param {Response} res - Response
*/
const CodeChangeMail = async (payload: any, req: Request, res: Response): Promise<void> => {
    const { user_id, current_email, email } = payload;
    
    const result = await putUserEmail(user_id, current_email, email);
    if (!result)
        throw new ContentError("CodeChangeMail", "errors.denied");

    res.status(200).json({
        status: "ok"
    })
}

export default CodeChangeMail;