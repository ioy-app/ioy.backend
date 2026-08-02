import { createCode } from "@/services/codes";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";
import passport from "passport";
import { Strategy } from "passport-custom";

passport.use(
    new Strategy(async ({ query: { email }}, done) => {
        try {
            console.log(email);
						const { value: login } = await promisegRPC(serviceUsers, "GetUserEmail", { email });
						const user = await promisegRPC(serviceUsers, "GetUser", { login });
            const code = await createCode(user?.id, { type: "login", email });
            console.log(login, code);
        }
        catch(err) { done(err, null); }
    })
);
