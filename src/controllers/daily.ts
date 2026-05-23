import Request from "@/types/request";
import { Response } from "express";
import { daily as dailyService } from "@/services/search";
import { getGameById } from "@/services/games";
import { getPicture } from "@/services/pictures";

/**
 * Daily hype game and picture
 * @param req - Request
 * @param res - Response
*/
const Daily = async(req: Request, res: Response): Promise<void> => {
  const items = await dailyService();

  const gamedata = await getGameById(Number(items?.game));
  const picturedata = await getPicture(Number(items?.picture));

  res.status(200).json({
    ...items,
    gamedata,
    picturedata
  });
}

export default Daily;