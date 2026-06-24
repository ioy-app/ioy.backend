import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get sdk file
 * @param req - Request
 * @param res - Response
*/
const getSDK = async(req: Request, res: Response): Promise<void> => {
  const fileStream = fs.readFileSync(path.join(__dirname, "sdk.js"), { encoding: "utf-8" });  
  res.setHeader("Content-Type", "text/javascript");
  res.send(fileStream);
}

export default getSDK;