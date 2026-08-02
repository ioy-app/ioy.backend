import Request from "@/types/request";
import { Response } from "express";
import putSubscribe from "@/services/subscribers/putSubscribe";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

const postUserSubscribe = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    const { value: id } = await promisegRPC(serviceUsers, "GetUserId", { login });
		const isSubscribe = await putSubscribe(req.user_id, id, "user");

    res.status(200).json({
        status: isSubscribe ? "created" : "deleted"
    });
}

export default postUserSubscribe;
