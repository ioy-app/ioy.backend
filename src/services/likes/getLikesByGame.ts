import getLikesByInstance from "./getLikesByInstance";

/**
 * Get likes counter by game
 * 
 * @param game_id - Game ID
 * @returns
*/
const getLikesByGame = async (game_id: number): Promise<number> =>
    await getLikesByInstance(game_id, "game");

export default getLikesByGame;