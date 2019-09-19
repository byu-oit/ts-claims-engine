export interface ValidationMiddlewareResponse {
    validation_response: { code: number, message: string };
}

export interface ClaimMiddlewareResponse {
    verified?: boolean;
    metadata: ValidationMiddlewareResponse;
}

export interface ClaimMiddlewareResponses {
    [key: string]: ClaimMiddlewareResponse;
}

export interface ClaimsResponse {
    [key: string]: boolean | BadRequest;
}

export interface Qualifiers {
    [key: string]: string;
}

export interface ClaimItem {
    concept: string;
    relationship: string;
    value: string;
    qualifier?: Qualifiers;
}

export interface Claim {
    subject: string;
    mode: 'ALL' | 'ANY' | 'ONE';
    claims: ClaimItem[];
}

export interface Claims {
    [key: string]: Claim;
}

export interface Concept {
    description: string;
    longDescription: string;
    type: string;
    range: string;
    qualifiers: string[];
    getValue: (subjectId: string, qualifiers?: Qualifiers) => Promise<string | number | boolean>;
}

export interface Concepts {
    [key: string]: Concept;
}

export interface ConceptInfo {
    id: string;
    description: string;
    longDescription: string;
    range: string;
    type: string;
    qualifiers: string[];
}

export class BadRequest extends Error {
    public errors: string[];

    constructor(...errors: string[]) {
        super('Invalid Claim');
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
