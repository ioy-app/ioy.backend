import CustomError from "./CustomError";

export default class ValidError extends CustomError {
    constructor(component, message) {
        super(`${component}, valid`, message);
    }
}