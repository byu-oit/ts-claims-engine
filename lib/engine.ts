import {camelCase} from 'change-case'
import {Concept} from './concept'
import {Claim, ClaimItem, Claims, ClaimsResponse, ConceptInfo, ConceptMap, Modes, Relationships,} from './types'
import {SubjectNotFound, ValidationError, ValueNotFound} from './error'

export class ClaimsAdjudicator {
    readonly concepts: ConceptMap

    readonly subjectExistsKey: string = 'subjectExists'

    // eslint-disable-next-line
    constructor(concepts: Concept<any>[]) {
        const subjectExistsKey = 'subjectExists'
        const subjectExistsConcept = concepts.find((prop) => camelCase(prop.name) === subjectExistsKey)
        if (!subjectExistsConcept) {
            throw new Error(`Missing required concept "${subjectExistsKey}" in concepts provided`)
        }
        this.subjectExistsKey = subjectExistsConcept.name
        this.concepts = concepts.reduce((map, concept) => ({...map, [concept.name]: concept}), {})
    }

    public verifyClaims = async (claims: Claims): Promise<ClaimsResponse> => {
        const response: ClaimsResponse = {}
        for (const key in claims) {
            if (!Object.prototype.hasOwnProperty.call(claims, key)) continue
            try { response[key] = await this.verifyClaim(claims[key]) }
            catch (e) { response[key] = e }
        }
        return response
    }

    public verifyClaim = async (claim: Claim): Promise<boolean> => {
        const {claims, mode, subject} = claim

        const validationErrors = this.validateClaim(claim)
        if (validationErrors.length) throw new ValidationError(...validationErrors)

        const subjectVerified = await this.testClaim(claim.subject, {
            concept: this.subjectExistsKey,
            relationship: Relationships.EQ,
            value: 'true'
        });
        if (!subjectVerified) throw new SubjectNotFound(claim.subject);

        if (mode && [Modes.ONE, Modes.ANY].includes(mode)) {
            return await this.testClaimsAny(subject, claims)
        } else {
            return await this.testClaimsAll(subject, claims)
        }
    }

    public conceptExists = (key: string): boolean => {
        return Object.prototype.hasOwnProperty.call(this.concepts, key)
    }

    public getConcept = (key: string): Concept<unknown> | undefined => {
        return this.concepts[key]
    }

    public getConcepts = (): ConceptInfo[] => {
        return Object.values(this.concepts).map(({ name, description, longDescription, relationships, qualifiers = []}) => {
            return {name, description, longDescription, relationships, qualifiers}
        })
    }

    private testClaim = async (subject: string, claim: ClaimItem): Promise<boolean> => {
        const {compare, cast, getValue} = this.getConcept(claim.concept) as Concept<unknown>

        const actual = await getValue(subject, claim.qualifier)
        if (actual === undefined && ![Relationships.UN, Relationships.DE].includes(claim.relationship)) {
            throw new ValueNotFound(subject, claim.concept)
        }

        switch (claim.relationship) {
            case Relationships.GT: return compare.greaterThan(actual, cast(claim.value))
            case Relationships.GTE: return compare.greaterThanOrEqual(actual, cast(claim.value))
            case Relationships.LT: return compare.lessThan(actual, cast(claim.value))
            case Relationships.LTE: return compare.lessThanOrEqual(actual, cast(claim.value))
            case Relationships.EQ: return compare.equal(actual, cast(claim.value))
            case Relationships.NE: return compare.notEqual(actual, cast(claim.value))
            case Relationships.UN: return compare.isUndefined(actual)
            case Relationships.DE: return compare.isDefined(actual)
        }
    }

    private testClaimsAll = async (subject: string, claims: ClaimItem[]): Promise<boolean> => {
        const results = await Promise.all(claims.map(claim => this.testClaim(subject, claim)))
        return !results.includes(false)
    }

    private testClaimsAny = async (subject: string, claims: ClaimItem[]): Promise<boolean> => {
        const results = await Promise.all(claims.map(claim => this.testClaim(subject, claim)))
        return results.includes(true)
    }

    private validateClaim (claim: Claim): string[] {
        return claim.claims.reduce((errs, cur) => [...errs, ...this.validateClaimItem(cur)], [] as string[])
    }

    private validateClaimItem (claimItem: ClaimItem): string[] {
        const errors: string[] = []

        const {concept: conceptName, qualifier, relationship} = claimItem
        const concept = this.getConcept(conceptName)
        if (!concept) {
            errors.push(`Concept ${conceptName} is not defined`)
            return errors
        }

        const {qualifiers, relationships} = concept
        if (qualifier) {
            const invalidQualifiers = Object.keys(qualifier).filter(q => !qualifiers.includes(q))
            if (invalidQualifiers.length) errors.push(...invalidQualifiers.map(q => `Qualifier ${q} is not defined for concept ${conceptName}`))
        }

        const validRelationship = relationships.includes(relationship)
        if (!validRelationship) errors.push(`Relationship ${relationship} is not defined for concept ${conceptName}`)

        return errors
    }
}
