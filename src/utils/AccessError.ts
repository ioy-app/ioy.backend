import CustomError from "./CustomError";

export default class AccessError extends CustomError {
    constructor(component, message) {
        super(`${component}, error`, message);
    }
}