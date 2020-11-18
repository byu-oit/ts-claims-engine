export class ValidationError extends Error {
    public errors: string[]

    constructor(...errors: string[]) {
        super(errors.join(', '))
        this.name = 'ValidationError'
        this.errors = errors
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}

export class SubjectNotFound extends Error {
    public subject: string

    constructor(subject: string) {
        super(`Could not find subject ${subject}`)
        this.name = 'SubjectNotFound'
        this.subject = subject
        Object.setPrototypeOf(this, SubjectNotFound.prototype)
    }
}
