import ContentError from "@/utils/ContentError";
import { getGameById } from "../games";
import getJam from "./getJam";
import { getGlobalVotes, getVote } from "../votes";

/**
 * Get instance place on the jam
 * @example
 * return getJamPlace(1, 10)
*/
const getJamPlace = async (jam_id: number): Promise<number> => {
  const votes = await getGlobalVotes(jam_id);
  const table = {};
  const results = {};
  for (const id of votes) {
    const vote = await getVote(id);
    if (!table[vote?.target_id])
      table[vote?.target_id] = {};
    if (!table[vote?.target_id][vote?.nomination])
      table[vote?.target_id][vote?.nomination] = 0;
    table[vote?.target_id][vote?.nomination] += vote?.score;
  }

  for (const [key, value] of Object.entries(table)) {
    if (!results[key])
      results[key] = 0;

    const nominations = Object.keys(value);
    const scores = Object.values(value);
    
    results[key] += scores.reduce((a, b) => a + Number(b), 0) / nominations?.length;
  }

  const instance_sorted = Object.keys(results).sort((a, b) => results[b] - results[a]);
  const places = {}
  let i = 1;
  for (const inst of instance_sorted) {
    places[inst] = {
      place: i++,
      score: results[inst]
    }
  }

  return places;
}

export default getJamPlace;