import getPopularTags from "@/services/getPopularTags";
import { Request, Response } from "express";

/**
 * Get pupular tags by pictures
 * @param req - Request
 * @param res - Response
*/
const getPicturesTags = async(req: Request, res: Response): Promise<void> => {
  const items = await getPopularTags("pictures");
  res.status(200).json({ items });
}

export default getPicturesTags;