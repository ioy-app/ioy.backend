import Request from "@/types/request";
import { Response } from "express";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";
import { Readable } from "stream";

/**
 * Get user avatar for sdk
 * @param req - Request
 * @param res - Response
*/
const getUserAvatar = async(req: Request, res: Response): Promise<void> => {
  try {
    const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });
    const { data: buffer } = await promisegRPC(serviceUsers, "GetUserFile", {
			login,
			type: "avatar"
		});

		const fileStream = Readable.from(buffer);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300");

    fileStream.on("error", () => {
      if (!res?.headersSent)
        res.status(404).end("errors.exists");
    });
    fileStream.pipe(res);
  }
  catch {
    res.status(404).end("errors.exists");
  }
}

export default getUserAvatar;
