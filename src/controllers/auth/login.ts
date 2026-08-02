import { Request, Response } from "express";
import createCode from "@services/codes/createCode";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";


/**
 * Login
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Login = async (req: Request, res: Response): Promise<void> => {
	const { email } = req.body;

	try {
		const { value: login } = await promisegRPC(serviceUsers, "GetUserEmailLogin", { email });
		const user = await promisegRPC(serviceUsers, "GetUser", { login });
		const code = await createCode(user?.id, { type: "login", email });
		console.log(code);
	}
	finally { res.status(200).end(); }
}

export default Login;
