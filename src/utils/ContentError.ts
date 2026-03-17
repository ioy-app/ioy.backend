import CustomError from "./CustomError";

export default class ContentError extends CustomError {
    constructor(component: string, message: string) {
        super(`${component}, content`, message);
    }
}