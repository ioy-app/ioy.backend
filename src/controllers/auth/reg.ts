import kafka from "@/lib/kafka";
import createUser from "@services/users/createUser";
import { Request, Response } from "express";

const producer = kafka.producer();

/**
 * Регистрация новой учетной записи
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Reg = async (req: Request, res: Response): Promise<void> => {
    await producer.connect();
    const { login, email } = req.body;
    await createUser(login, email);

    
    await producer.send({
        topic: "notify",
        messages: [
            {
                key: `${login}:${email}`,
                value: JSON.stringify({
                    type: "reg",
                    subject: `Welcome, ${login}!`,
                    email,
                    login,
                    props: {
                        login,
                        email
                    }
                })
            }
        ]
    });
    await producer.disconnect();

    res.status(200).end();
}

export default Reg;