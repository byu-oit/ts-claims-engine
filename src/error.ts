export class BadRequest extends Error {
    public errors: string[];

    constructor(...errors: string[]) {
        super('Bad Request');
        this.errors = errors || [];
        Object.setPrototypeOf(this, BadRequest.prototype);
    }
}

export class ValidationError extends BadRequest {
    constructor(...errors: string[]) {
        super(...errors);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class UnidentifiedSubjectError extends BadRequest {
    constructor(...errors: string[]) {
        super(...errors);
        Object.setPrototypeOf(this, UnidentifiedSubjectError.prototype);
    }
}

export class InternalError extends Error {
    public errors: string[];

    constructor(...errors: string[]) {
        super('Internal Error');
        this.errors = errors || [];
        Object.setPrototypeOf(this, InternalError.prototype);
    }
}
