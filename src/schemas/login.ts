import { z } from "zod";

const LoginSchema = z.string("errors.invalid.login")
    .min(3, "errors.invalid.login")
    .max(50, "errors.invalid.login")
    .regex(/^[a-zA-Z0-9_-]+$/, "errors.invalid.login");

export default LoginSchema;