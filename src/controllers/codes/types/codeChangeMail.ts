import ContentError from "@/utils/ContentError";
import promisegRPC from "@/utils/promisegRPC";
import { Request, Response } from "express";
import { serviceUsers } from "index";

/**
 * Change email
 * 
 * @param {any} payload - Payload data
 * @param {Request} req - Request 
 * @param {Response} res - Response
*/
const CodeChangeMail = async (payload: any, req: Request, res: Response): Promise<void> => {
    const {
			user_id,
			current_email,
			email: new_email
		} = payload;
    
		const { value } = await promisegRPC(serviceUsers, "EditUserIdEmail", {
			user_id,
			current_email,
			new_email
		});

    if (!value)
        throw new ContentError("CodeChangeMail", "errors.denied");

    res.status(200).json({
        status: "ok"
    })
}

export default CodeChangeMail;
