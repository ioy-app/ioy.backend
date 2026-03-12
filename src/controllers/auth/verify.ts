import activeUser from "@/services/users/activeUser";
import ContentError from "@/utils/ContentError";
import { Request, Response } from "express";

/**
 * Verify user code to activate
 * @param req - Request
 * @param res - Response
*/
const Verify = async(req: Request, res: Response): Promise<void> => {
  const code = req?.query?.code && String(req?.query?.code);

  if (!code)
    throw new ContentError("Verify", "errors.exists");

  await activeUser(code);

  res.status(200).end();
}

export default Verify;