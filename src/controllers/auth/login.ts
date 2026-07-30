import { Request, Response } from "express";
import createCode from "@services/codes/createCode";
import { getUserEmailLogin } from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";


/**
 * Login
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Login = async (req: Request, res: Response): Promise<void> => {
	const { email } = req.body;

	try {
		const login = await getUserEmailLogin(email);
		const user = await getUser(login);
		const code = await createCode(user?.id, { type: "login", email });
		console.log(code);
	}
	finally { res.status(200).end(); }
}

export default Login;
