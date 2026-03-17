import { createCode } from "@/services/codes";
import getUserEmail from "@/services/users/getUserEmail";
import passport from "passport";
import { Strategy } from "passport-custom";

passport.use(
    new Strategy(async ({ query: { email }}, done) => {
        try {
            console.log(email);
            const user = await getUserEmail(email as string);
            const code = await createCode(user?.id, { type: "login", email });
            console.log(user, code);
        }
        catch(err) { done(err, null); }
    })
);