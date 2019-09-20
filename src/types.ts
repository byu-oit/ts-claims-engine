import {Concept} from './engine/concept';

export interface ValidationMiddlewareResponse {
    validation_response: { code: number, message: string };
}

export interface ClaimMiddlewareResponse {
    verified?: boolean;
    metadata: ValidationMiddlewareResponse;
}

export interface ClaimMiddlewareResponseBody {
    [key: string]: ClaimMiddlewareResponse;
}

export interface ClaimsResponse {
    [key: string]: boolean | InternalError | BadRequest;
}

export interface Qualifiers<> {
    [key: string]: any;
}

export type Relationship = 'gt' | 'gt_or_eq' | 'lt' | 'lt_or_eq' | 'eq' | 'not_eq';

export interface ClaimItem {
    concept: string;
    relationship: Relationship;
    value: string;
    qualifier?: Qualifiers;
}

export interface Claim {
    subject: string;
    mode: 'all' | 'any' | 'one';
    claims: ClaimItem[];
}

export interface Claims {
    [key: string]: Claim;
}

export interface Concepts {
    [key: string]: Concept<any>;
}

export interface EssentialConcepts extends Concepts {
    subjectExists: Concept<string>;
}

export interface ConceptInfo {
    id: string;
    description: string;
    longDescription: string;
    type: string;
    relationships: Relationship[];
    qualifiers: string[];
}

export interface ConceptOptions<T> {
    description: string;
    longDescription: string;
    type: string;
    relationships: Relationship[];
    qualifiers?: string[];
    getValue: (subjectId: string, qualifiers?: Qualifiers) => Promise<T>;
    compare?: (a: T, b: T) => number;
    cast?: (value: string) => T;
}

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
