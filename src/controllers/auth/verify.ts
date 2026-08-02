import ContentError from "@/utils/ContentError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";
dotenv.config();

/**
 * Verify user code to activate
 * @param req - Request
 * @param res - Response
*/
const Verify = async(req: Request, res: Response): Promise<void> => {
  const code = req?.query?.code && String(req?.query?.code);

  if (!code)
    throw new ContentError("Verify", "errors.exists");

	const { id: user_id } = jwt.verify(code, process.env.SECRET);

	await promisegRPC(serviceUsers, "SetUserIdActive", { user_id });
  res.status(200).end();
}

export default Verify;
