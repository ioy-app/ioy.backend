import { UserDetails } from "@/types/user";
import AccessError from "@/utils/AccessError";
import promisegRPC from "@/utils/promisegRPC";
import dayjs from "dayjs";
import { Request, Response } from "express";
import { serviceUsers } from "index";
import { Readable } from "stream";

/**
 * Get user banner
 * 
 * @param req - Request 
 * @param res - Response 
*/
const getUserBanner = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    try {
        const data: UserDetails = await promisegRPC(serviceUsers, "GetUser", { login });

        if (data?.date_ban && dayjs(data?.date_ban).isAfter(dayjs()))
            throw new AccessError("getUserBanner", "errors.denied");

        const { data: buffer } = await promisegRPC(serviceUsers, "GetUserFile", {
					login,
					type: "banner"
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

export default getUserBanner;
