import {Concept} from './concept';
import {BadRequest, InternalError} from './error';

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

export type GetValueFunction<T> = (subjectId: string, qualifiers?: Qualifiers) => Promise<T>;

export type NumberCompareFn<T> = (left: T, right: T) => number;
