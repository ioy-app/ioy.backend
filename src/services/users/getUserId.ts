import getUser from "./getUser";

/**
 * Get user ID
 *
 * @param login - Login
 * @returns
*/
const getUserId = async (login: string): Promise<number> => {
	const user = await getUser(login);
	return Number(user?.id);
}

export default getUserId;
