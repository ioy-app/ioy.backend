import { z } from "zod";

const LoginSchema = z.string("errors.invalid.login")
	.trim("errors.invalid.login")
  .min(3, "errors.invalid.login")
  .max(30, "errors.invalid.login")
  .regex(/^[a-zA-Z0-9_-]+$/, "errors.invalid.login");

export default LoginSchema;
