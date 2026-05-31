import { Request, Response } from "express";
import dotenv from "dotenv";
import getUser from "@/services/users/getUser";
import logger from "@/lib/logger";
import donutUser from "@/services/users/donutUser";

dotenv.config();

/**
 * Ko-fi webhook
 * @param req - Request
 * @param res - Response
*/
const KoFi = async(req: Request, res: Response): Promise<void> => {
  const payload = JSON.parse(req?.body?.data);
  logger.info("Ko-fi webhook", payload);

  if (payload?.verification_token !== process.env.KOFI_TOKEN) {
    logger.error("Ko-fi verify failed");
    res.sendStatus(403);
    return;
  }

  try {
    const login = payload?.message?.trim?.();
    const userdata = await getUser(login);
    await donutUser(userdata.id, 30);
    logger.info("Ko-fi update donut status", {
      userdata,
      payload
    });
  }
  catch { logger.error("Ko-fi find user failed", payload); }

  res.sendStatus(200);
}

export default KoFi;