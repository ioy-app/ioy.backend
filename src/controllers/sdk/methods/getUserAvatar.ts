import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";
import getUserAvatarService from "@/services/users/getUserAvatar";

/**
 * Get user avatar for sdk
 * @param req - Request
 * @param res - Response
*/
const getUserAvatar = async(req: Request, res: Response): Promise<void> => {
  try {
    const login = await getUserLogin(req?.user_id);
    const fileStream = await getUserAvatarService(login);

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