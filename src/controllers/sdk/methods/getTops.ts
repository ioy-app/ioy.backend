import { getScoreTops } from "@/services/highscores";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get tops by game
 * @param req - Request
 * @param res - Response
*/
const getTops = async(req: Request, res: Response): Promise<void> => {
  const game_id = Number(
      req?.headers?.referer?.match?.(/\/games\/(\d+)\//)?.[1]
  );

  const result = await getScoreTops(game_id, 5);

  res.status(200).json(result);
}

export default getTops;