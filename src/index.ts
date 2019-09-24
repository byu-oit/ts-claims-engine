import {camelCase} from 'change-case';
import {ClaimItem, ClaimsResponse, ConceptInfo, Concepts, EssentialConcepts,} from './types';
import {BadRequest, InternalError, UnidentifiedSubjectError, ValidationError} from './error';
import {Concept} from './concept'

export class ClaimsAdjudicator {
    private readonly conceptMap: EssentialConcepts;

    constructor(concepts: Concepts) {
        const subjectExistsKey = Object.keys(concepts).find((prop) => camelCase(prop) === 'subjectExists');
        if (!subjectExistsKey) {
            throw new Error('Missing required concept `subjectExists` in concepts provided.');
        }
        const subjectExists = {subjectExists: concepts[subjectExistsKey]};
        this.conceptMap = Object.assign(concepts, subjectExists);
    }

    public verifyClaims = async (claims: any): Promise<ClaimsResponse> => {
        if (claims === null || typeof claims !== 'object') {
            throw new BadRequest(`Claims must be a non-null object.`);
        }
        const response: ClaimsResponse = {};
        for (const key in claims) {
            if (!Object.prototype.hasOwnProperty.call(claims, key)) {
                continue;
            }
            let value: boolean | InternalError | BadRequest;
            try {
                value = await this.verifyClaim(claims[key]);
            } catch (e) {
                value = e;
            }
            response[key] = value;
        }
        return response;
    };

    public verifyClaim = async (claim: any): Promise<boolean | InternalError | BadRequest> => {
        await this.validateClaim(claim);
        const {claims, mode, subject} = claim;
        if (['one', 'any'].includes(mode)) {
            return await this.testClaimsAny(subject, claims);
        } else {
            return await this.testClaimsAll(subject, claims);
        }
    };

    public conceptExists = (key: string): boolean => {
        return Object.prototype.hasOwnProperty.call(this.conceptMap, key);
    };

    public getConcept = (key: string): Concept<any> => {
        return this.conceptMap[key];
    };

    public getConcepts = (): ConceptInfo[] => {
        return Object.entries(this.conceptMap)
            .map(([id, {description, longDescription, type, relationships, qualifiers}]) => {
                return {id, description, longDescription, type, relationships, qualifiers};
            });
    };

    private testClaim = async (subject: string, claim: ClaimItem): Promise<boolean> => {
        const {compare, cast, getValue} = this.getConcept(claim.concept);

        let expected;
        let actual;

        try {
            expected = cast(claim.value);
            actual = await getValue(subject, claim.qualifier);

            switch (claim.relationship) {
                case 'gt': {
                    return compare.greaterThan(actual, expected);
                }
                case 'gt_or_eq': {
                    return compare.greaterThanOrEqual(actual, expected);
                }
                case 'lt': {
                    return compare.lessThan(actual, expected);
                }
                case 'lt_or_eq': {
                    return compare.lessThanOrEqual(actual, expected);
                }
                case 'eq': {
                    return compare.equal(actual, expected);
                }
                case 'not_eq': {
                    return compare.notEqual(actual, expected);
                }
                default: {
                    throw new Error(`Unknown relationship '${claim.relationship}' in claim.`)
                }
            }
        } catch (e) {
            throw new InternalError(e.message);
        }
    };

    private testClaimsAll = async (subject: string, claims: ClaimItem[]): Promise<boolean> => {
        for (const claim of claims) {
            if (!await this.testClaim(subject, claim)) {
                return false;
            }
        }
        return true;
    };

    private testClaimsAny = async (subject: string, claims: ClaimItem[]): Promise<boolean> => {
        for (const claim of claims) {
            if (await this.testClaim(subject, claim)) {
                return true;
            }
        }
        return false;
    };

    private validateClaim = async (claim: any): Promise<void> => {
        if (claim === null || typeof claim !== 'object') {
            throw new ValidationError(`Claim must be an non-null object.`);
        }

        // Must have subjectExists concept and dependencies
        const hasSubject = typeof claim.subject === 'string';
        if (!hasSubject) {
            throw new ValidationError('Claim subject must be a string.');
        }

        const subjectVerified = await this.testClaim(claim.subject, {
            concept: 'subjectExists',
            relationship: 'eq',
            value: 'true'
        });
        if (!subjectVerified) {
            throw new UnidentifiedSubjectError(`Unidentified subject ${claim.subject}.`);
        }

        const validMode = ['all', 'any', 'one', undefined].includes(claim.mode);

        if (!validMode) {
            throw new ValidationError(`Invalid mode in ClaimItem: ${claim.mode}.`);
        }

        const validClaims = Array.isArray(claim.claims)
            && claim.claims.length > 0
            && claim.claims.every(this.validateClaimItem);

        if (!validClaims) {
            throw new ValidationError(`Invalid claims in ClaimItems ${JSON.stringify(claim.claims)}.`);
        }
    };

    private validateClaimItem = (claimItem: any): boolean => {
        const concept = this.getConcept(claimItem.concept);
        if (!concept) {
            return false;
        }

        if (claimItem.qualifier) {
            const validQualifierObj = typeof claimItem.qualifier === 'object'
                && Object.keys(claimItem.qualifier).every((key) => {
                    return concept.qualifiers.includes(key);
                });
            if (!validQualifierObj) {
                return false;
            }
        }

        return typeof claimItem === 'object'
            && typeof claimItem.concept === 'string'
            && typeof claimItem.value === 'string'
            && concept.relationships.includes(claimItem.relationship);
    };
}
