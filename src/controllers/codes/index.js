import Create from "./create.js";
import express from "express";

import Check from "./check.js";

const Router = new express.Router();

Router.post("/", Check);

export function generate(size=6) {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < size; i++)
        code += digits[~~(Math.random() * digits.length)];
    return code.padStart(size, "0");
}
export const CODE_TIMER = 1000 * 60 * 5;

export default Router;
export {
    Create
}