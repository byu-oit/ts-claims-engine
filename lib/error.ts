export class ValidationError extends Error {
    public errors: string[]

    constructor(...errors: string[]) {
        super(errors.join(', '))
        this.name = 'ValidationError'
        this.errors = errors
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}

export class NotFound extends Error {
    constructor(public target: string) {
        super(`Target not found ${target}`);
        this.name = 'NotFound'
        Object.setPrototypeOf(this, NotFound.prototype)
    }
}

export class SubjectNotFound extends NotFound {
    constructor(subject: string) {
        super(subject)
        this.message = `Could not find subject ${subject}`
        this.name = 'SubjectNotFound'
        Object.setPrototypeOf(this, SubjectNotFound.prototype)
    }
}

export class ValueNotFound extends NotFound {
    constructor(subject: string, concept: string) {
        super(subject)
        this.message = `Could not get value for subject ${subject} within the concept ${concept}`
        this.name = 'ValueNotFound'
        Object.setPrototypeOf(this, ValueNotFound.prototype)
    }
}
