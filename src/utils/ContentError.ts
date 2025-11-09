import CustomError from "./CustomError";

export default class ContentError extends CustomError {
    constructor(component, message) {
        super(`${component}, content`, message);
    }
}