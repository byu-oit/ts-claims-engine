import {camelCase} from 'change-case';
import {
    BadRequest,
    ClaimItem,
    ClaimsResponse,
    ConceptInfo,
    Concepts,
    UnidentifiedSubjectError,
    ValidationError
} from '../types';
import {Concept} from './concept';

export class ClaimsAdjudicator {
    private readonly conceptMap: Concepts;

    public async verifyClaims(claims: any): Promise<ClaimsResponse> {
        if (claims !== null || typeof claims !== 'object') {
            throw new BadRequest(`Claims must be a non-null object.`);
        }
        const response: ClaimsResponse = {};
        for (const key in claims) {
            if (!Object.prototype.hasOwnProperty.call(claims, key)) {
                continue;
            }
            response[key] = await this.verifyClaim(claims[key]);
        }
        return response;
    }

    public async verifyClaim(claim: any): Promise<boolean | BadRequest> {
        try {
            this.validateClaim(claim);
        } catch (e) {
            return e;
        }

        const {claims, mode, subject} = claim;
        if (['ONE', 'ANY'].includes(mode)) {
            return this.testClaimsAny(subject, claims);
        } else {
            return this.testClaimsAll(subject, claims);
        }
    }

    public conceptExists(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.conceptMap, key);
    }

    public getConcept(key: string): Concept<any> {
        return this.conceptMap[key];
    }

    public getConcepts = (): ConceptInfo[] => {
        return Object.entries(this.conceptMap)
            .map(([id, {description, longDescription, type, relationships, qualifiers}]) => {
                return {id, description, longDescription, type, relationships, qualifiers};
            });
    };

    private async testClaim(subject: string, claim: ClaimItem): Promise<boolean> {
        const {compare, cast, getValue} = this.getConcept(claim.concept);
        switch (claim.relationship.toLowerCase()) {
            case 'gt': {
                return compare.greaterThan(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            case 'gt_or_eq': {
                return compare.greaterThanOrEqual(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            case 'lt': {
                return compare.lessThan(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            case 'lt_or_eq': {
                return compare.lessThanOrEqual(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            case 'eq': {
                return compare.equal(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            case 'not_eq': {
                return compare.notEqual(await getValue(subject, claim.qualifier), cast(claim.value));
            }
            default:
                return false; // Unrecognized Relationship
        }
    }

    private async testClaimsAll(subject: string, claims: ClaimItem[]): Promise<boolean> {
        for (const claim of claims) {
            if (!await this.testClaim(subject, claim)) {
                return false;
            }
        }
        return true;
    }

    private async testClaimsAny(subject: string, claims: ClaimItem[]): Promise<boolean> {
        for (const claim of claims) {
            if (await this.testClaim(subject, claim)) {
                return true;
            }
        }
        return false;
    }

    private validateClaim(claim: any): void {
        if (claim === null || typeof claim !== 'object') {
            throw new ValidationError(`Claim must be an non-null object.`);
        }

        const concept = Object.keys(this.conceptMap).find(prop => camelCase(prop) === 'subjectExists');
        const subjectExists = typeof claim.subject === 'string'
            && concept
            && this.testClaim(claim.subject, {concept, relationship: 'eq', value: 'true'});

        if (!subjectExists) { // Quick exit if unidentifiable subject
            throw new UnidentifiedSubjectError(`Unidentified subject ${claim.subject}.`);
        }

        const validMode = claim.mode !== undefined
            && ['ALL', 'ANY', 'ONE'].includes(claim.mode);

        if (!validMode) {
            throw new ValidationError(`Invalid mode in ClaimItem: ${claim.mode}.`);
        }

        const validClaims = Array.isArray(claim.claims)
            && claim.claims.length > 0
            && claim.claims.every(this.validateClaimItem);

        if (!validClaims) {
            throw new ValidationError(`Invalid claims in ClaimItem ${claim.claims}.`);
        }
    }

    private validateClaimItem(claimItem: any): boolean {
        return claimItem !== null
            && typeof claimItem === 'object'
            && typeof claimItem.concept === 'string'
            && typeof claimItem.value === 'string'
            && this.conceptExists(claimItem.concept)
            && this.validateRelationship(claimItem.relationship);
    }

    private validateRelationship(relationship: string): boolean {
        return ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'].includes(relationship.toLowerCase());
    }

    constructor(concepts: Concepts) {
        this.conceptMap = concepts
    }
}
