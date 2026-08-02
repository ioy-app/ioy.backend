import { Request, Response } from "express";
import dotenv from "dotenv";
import logger from "@/lib/logger";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

dotenv.config();

/**
 * Ko-fi webhook
 * @param req - Request
 * @param res - Response
*/
const KoFi = async (req: Request, res: Response): Promise<void> => {
  logger.info("Ko-fi webhook started", {
    body: req.body
  });
  const payload = JSON.parse(req?.body?.data);
  logger.info("Ko-fi webhook", payload);

  if (payload?.verification_token !== process.env.KOFI_TOKEN) {
    logger.error("Ko-fi verify failed");
    res.sendStatus(403);
    return;
  }

  try {
    const login = payload?.message?.trim?.();
    const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
    await promisegRPC(serviceUsers, "setUserIdDonut", {
			user_id: userdata?.id,
			days: 30
		});
    logger.info("Ko-fi update donut status", {
      userdata,
      payload
    });
  }
  catch { logger.error("Ko-fi find user failed", payload); }

  res.sendStatus(200);
}

export default KoFi;
