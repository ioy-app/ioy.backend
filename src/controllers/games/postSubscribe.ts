import { checkSubscribe, putSubscribe } from "@/services/subscribers";
import Request from "@/types/request";
import { Response } from "express";

/**
 * 
 * @param req - Request
 * @param res - Response
*/
const postSubscribe = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const is_subscribe = await putSubscribe(Number(req.user_id), Number(id), "game");
    let status: string = is_subscribe ? "created" : "deleted";
    
    res.status(200).json({ status });
}

export default postSubscribe;