import { Request, Response } from "express";
import getUserEmail from "@services/users/getUserEmail";
import createCode from "@services/codes/createCode";

const Login = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {

        const user = await getUserEmail(email);
        const code = await createCode(user?.id, { type: "login", email });
        console.log(code);   
    }
    catch(err) {

    }
    finally { res.status(200).end(); }
}

export default Login;