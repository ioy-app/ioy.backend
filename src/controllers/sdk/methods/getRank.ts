import { readScore } from "@/services/highscores";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get rank user on highscores
 * @param req - Request
 * @param res - Response
*/
const getRank = async(req: Request, res: Response): Promise<void> => {
  
  const game_id = Number(
      req?.headers?.referer?.match?.(/\/games\/(\d+)\//)?.[1]
  );

  const result = await readScore(req?.user_id, game_id);

  res.status(200).json(result);
}

export default getRank;