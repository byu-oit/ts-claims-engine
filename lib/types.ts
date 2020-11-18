import {Concept} from './concept'
import {SubjectNotFound, ValidationError} from './error'
import {Comparator} from './comparator';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface ClaimsResponse {
    [key: string]: boolean | ValidationError | SubjectNotFound | Error
}

export interface Qualifiers {
    [key: string]: unknown
}

export enum Relationships {
    GT = 'gt',
    GTE = 'gt_or_eq',
    LT = 'lt',
    LTE = 'lt_or_eq',
    EQ = 'eq',
    NE = 'not_eq'
}

export type Relationship = Relationships.GT | Relationships.GTE | Relationships.LT | Relationships.LTE | Relationships.EQ | Relationships.NE

export enum Modes {
    ONE = 'one',
    ANY = 'any',
    ALL = 'all'
}

export type Mode = Modes.ONE | Modes.ANY | Modes.ALL

export interface ClaimItem {
    concept: string
    relationship: Relationship
    value: string
    qualifier?: Qualifiers
}

export interface Claim {
    subject: string
    mode?: Mode
    claims: ClaimItem[]
}

export interface Claims {
    [key: string]: Claim
}

export interface ConceptMap {
    [key: string]: Concept<unknown>;
}

export interface ConceptInfo {
    name: string
    description: string
    longDescription?: string
    relationships: Relationship[]
    qualifiers: string[]
}

export interface ConceptOptions<T> {
    name: string
    description: string
    longDescription?: string
    relationships: [Relationship, ...Relationship[]]
    qualifiers?: string[]
    getValue: GetValueFunction<T>
    compare: CompareFn<T> | Comparator<T>
    cast: CastFn<T>
}

export type GetValueFunction<T> = (subjectId: string, qualifiers?: Qualifiers) => Promise<T>

export type CompareFn<T> = (left: T, right: T) => number

export type CastFn<T> = (value: string) => T
