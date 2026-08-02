import AccessError from "@/utils/AccessError";
import promisegRPC from "@/utils/promisegRPC";
import dayjs from "dayjs";
import { Request, Response } from "express";
import { serviceUsers } from "index";
import { Readable } from "stream";

/**
 * Get user avatar
 * 
 * @param req - Request 
 * @param res - Response 
*/
const getUserAvatar = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    try {
        const data = await promisegRPC(serviceUsers, "GetUser", { login });

        if (data?.date_ban && dayjs(data?.date_ban).isAfter(dayjs()))
            throw new AccessError("getUserAvatar", "errors.denied");

        const { data: buffer } = await promisegRPC(serviceUsers, "GetUserFile", {
					login,
					type: "avatar"
				});

				const fileStream = Readable.from(buffer);

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");
        
        fileStream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        fileStream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getUserAvatar;
