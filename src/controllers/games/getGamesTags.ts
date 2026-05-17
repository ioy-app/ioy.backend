import getPopularTags from "@/services/getPopularTags";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get pupular tags by games
 * @param req - Request
 * @param res - Response
*/
const getGamesTags = async(req: Request, res: Response): Promise<void> => {
  const items = await getPopularTags("games");
  res.status(200).json({ items });
}

export default getGamesTags;