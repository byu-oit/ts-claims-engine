import {assert} from 'chai';
import {ClaimsAdjudicator, Concept} from '../src';

describe('Claims Adjudicator', () => {
    const subjects: { [key: string]: { age: number; birth_date: string; favorite_color: string; } } = {
        '123456789': {
            'age': 23,
            'birth_date': '1995-10-23',
            'favorite_color': 'blue'
        },
        '987654321': {
            'age': 16,
            'birth_date': '2000-07-11',
            'favorite_color': 'green'
        },
        '123456987': {
            'age': 25,
            'birth_date': '1993-09-10',
            'favorite_color': 'red'
        }
    };

    const concepts = {
        subject_exists: new Concept({
            description: 'The subject exists',
            longDescription: 'Determines whether a subject is a known entity within the domain',
            type: 'boolean',
            relationships: ['eq', 'not_eq'],
            qualifiers: ['age', 'birth'],
            getValue: async (id: string) => subjects[id] !== undefined
        }),
        age: new Concept({
            description: 'The subject is of age',
            longDescription: 'Determines if the subject is of an age',
            type: 'int',
            relationships: ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].age
        }),
        favorite_color: new Concept({
            description: 'The subject has the favorite color',
            longDescription: 'The subject considers their favorite color to be',
            type: 'string',
            relationships: ['eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].favorite_color
        })
    };
    const claims = {
        'trueClaim': {
            'subject': '123456789',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'eq',
                    'value': 'blue'
                }
            ]
        },
        'falseClaim': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'gt_or_eq',
                    'value': '21'
                }
            ]
        }
    };

    let engine: ClaimsAdjudicator;

    beforeEach(() => {
        engine = new ClaimsAdjudicator(concepts);
    });

    describe('getConcepts', () => {
        it('will return the concepts list', () => {
            const concepts = engine.getConcepts();
            assert.strictEqual(concepts.length, 3);

            concepts.forEach(concept => {
                assert.isString(concept.description);
                assert.isString(concept.longDescription);
                assert.isString(concept.type);
                assert.isArray(concept.qualifiers);
                concept.qualifiers.forEach(qualifier => {
                    assert.isString(qualifier);
                });
                assert.isArray(concept.relationships);
                concept.relationships.forEach(relationship => {
                    assert.isTrue(['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'].includes(relationship))
                })
            })
        });
    });

    describe('getConcept', () => {
        it('will return the concept when it exists', () => {
            const concept = engine.getConcept('subject_exists');
            assert.isString(concept.description);
            assert.isString(concept.longDescription);
            assert.isString(concept.type);
            assert.isArray(concept.qualifiers);
            assert.isFunction(concept.getValue);
        });
        it('will not return undefined when the concept is not found', () => {
            const concept = engine.getConcept('not_test_concept');
            assert.isUndefined(concept);
        });
    });

    describe('conceptExists', () => {
        it('will return true when the concept exists', () => {
            assert.isTrue(engine.conceptExists('subject_exists'));
            assert.isTrue(engine.conceptExists('age'));
            assert.isTrue(engine.conceptExists('favorite_color'));
        });
        it('will return false when the concept does not exists', () => {
            assert.isFalse(engine.conceptExists('does_not_exist'));
        });
    });

    describe('verifyClaim', () => {
        it('will return true for a true claim', async () => {
            const verified = await engine.verifyClaim(claims['trueClaim']);
            assert.isTrue(verified);
        });
        it('will return false for a false claim', async () => {
            const verified = await engine.verifyClaim(claims['falseClaim']);
            assert.isFalse(verified);
        });
    });

    describe('verifyClaims', () => {
        it('will return an object, listing the claims verification responses', async () => {
            const responses = await engine.verifyClaims(claims);
            assert.hasAllKeys(responses, ['trueClaim', 'falseClaim']);
            assert.isTrue(responses['trueClaim']);
            assert.isFalse(responses['falseClaim']);
        })
    })
});
