export default class CustomError extends Error {
    constructor(component: string, message: string) {
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