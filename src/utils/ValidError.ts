import CustomError from "./CustomError";

export default class ValidError extends CustomError {
    constructor(component: string, message: string) {
        super(`${component}, valid`, message);
    }
}