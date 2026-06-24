import { writeScore } from "@/services/highscores";

/**
 * Set score to highscore
 * @param req - Request
 * @param res - Response
*/
const setScore = async(req: Request, res: Response): Promise<void> => {
  const game_id = Number(
      req?.headers?.referer?.match?.(/\/games\/(\d+)\//)?.[1]
  );

  const result = await writeScore(req?.user_id, game_id, req?.body?.score);
  res.status(200).json(result);
}

export default setScore;