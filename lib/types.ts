import {Concept} from './concept'
import {NotFound, ValidationError} from './error'
import {Comparator} from './comparator';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface ClaimsResponse {
    [key: string]: boolean | ValidationError | NotFound | Error
}

export interface Qualifiers {
    [key: string]: unknown
}

export enum Relationship {
    GT = 'gt',
    GTE = 'gt_or_eq',
    LT = 'lt',
    LTE = 'lt_or_eq',
    EQ = 'eq',
    NE = 'not_eq',
    UN = 'undefined',
    DE = 'defined'
}

export enum Mode {
    ONE = 'one',
    ANY = 'any',
    ALL = 'all'
}

export type ClaimItem = {
    concept: string
    relationship: Relationship.GT | Relationship.GTE | Relationship.LT | Relationship.LTE | Relationship.EQ | Relationship.NE
    value: string
    qualifier?: Qualifiers
} | {
    concept: string
    relationship: Relationship.UN | Relationship.DE
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

export type GetValueFunction<T> = (subjectId: string, qualifiers?: Qualifiers) => Promise<T | undefined>

export type CompareFn<T> = (left: T, right: T) => number

export type CastFn<T> = (value: string) => T
