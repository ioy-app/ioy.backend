import { getGameById } from "@/services/games";
import { getVote, getVotes as getVotesService } from "@/services/votes";
import Request from "@/types/request";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Get all votes by game on jam
 * @param req - Request
 * @param res - Response
*/
const getVotes = async(req: Request, res: Response): Promise<void> => {
  const game_id = Number(req?.params?.id);
  const gamedata = await getGameById(game_id);

  if (!gamedata?.jam_id)
    throw new ContentError("getVotes", "errors.no_include_jam");

  const votes = await getVotesService(req.user_id, gamedata.jam_id, game_id);
  const items = [];
  for (const vote_id of votes) {
    const data = await getVote(vote_id);
    items.push(data);
  }

  res.status(200).json({
    items,
    total: items?.length
  });
}

export default getVotes;