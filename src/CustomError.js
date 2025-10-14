export default class CustomError extends Error {
    constructor(component, message) {
        super(message);
        this.component = component;
        this.message = message;
    }

    show() {
        return `[${this.component}] ${this.message}`;
    }

    toString() {
        return this?.message;
    }
}