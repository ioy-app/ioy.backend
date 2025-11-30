import CustomError from "./CustomError";

export default class AccessError extends CustomError {
    constructor(component: string, message: string) {
        super(`${component}, error`, message);
    }
}