import Game from "@/schemas/game";
import { getGameById } from "@/services/games";
import { getGamesByJam as getGamesByJamService } from "@/services/jams";
import promisegRPC from "@/utils/promisegRPC";
import { Request, Response } from "express";
import { serviceUsers } from "index";

/**
 * Get games by jam
 * @param req - Request
 * @param res - Response
*/
const getGamesByJam = async(req: Request, res: Response): Promise<void> => {
  const offset: number = req.query.offset && Number(req.query.offset);
  const limit: number = req.query.limit && Number(req.query.limit);
  const search: string = req.query?.search && String(req.query.search) || undefined;
  const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");
  const [ games_ids, total ] = await getGamesByJamService(
      Number(req.params?.id),
      offset,
      limit,
      search,
      sort
  );

  const items: Game[] = [];
  for (const id of games_ids) {
      const game = await getGameById(Number(id));
      const { value: creater_login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: game?.creater_id });
      const creater_data = await promisegRPC(serviceUsers, "GetUser", { login: creater_login });
      items.push({
          ...game,
          creater_data
      });
  }

  res.status(200).json({
      items,
      offset,
      limit,
      total
  });
}

export default getGamesByJam;
