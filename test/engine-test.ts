import {assert} from 'chai';
import * as _ from 'lodash';
import {BadRequest, InternalError, UnidentifiedSubjectError} from '../src/error';
import {ClaimsAdjudicator} from '../src'
import {testClaims, testConcepts} from './static';

describe('Claims Adjudicator', () => {
    let engine: ClaimsAdjudicator;

    it('should fail when a faulty configuration is given to the ClaimsAdjudicator', () => {
        try {
            new ClaimsAdjudicator(_.pick(testConcepts, 'age'));
        } catch (e) {
            assert.isTrue(true);
        }
    });
    it('should fail requests when given a faulty cast in a concept', async () => {
        const concepts = _.pick(testConcepts, ['subject_exists', 'bad_cast_favorite_color']);
        const claims = _.pick(testClaims, ['1', '2']);

        const ca = new ClaimsAdjudicator(concepts);
        const responses = await ca.verifyClaims(claims);

        Object.values(responses).forEach(response => {
            assert.isTrue(response instanceof InternalError);
        })
    });

    before(() => {
        const concepts = _.omit(testConcepts, ['bad_cast_favorite_color', 'bad_compare_favorite_color']);
        engine = new ClaimsAdjudicator(concepts);
    });

    describe('getConcepts', () => {
        it('will return the concepts list', () => {
            const concepts = engine.getConcepts();
            assert.isArray(concepts);

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
            const concept = engine.getConcept('subjectExists');
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
            assert.isTrue(engine.conceptExists('subjectExists'));
            assert.isTrue(engine.conceptExists('age'));
            assert.isTrue(engine.conceptExists('favorite_color'));
        });
        it('will return false when the concept does not exists', () => {
            assert.isFalse(engine.conceptExists('does_not_exist'));
        });
    });

    describe('verifyClaims', () => {
        it('will return an object, listing all true claim verification responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('t')));
            const responses = await engine.verifyClaims(claims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response)
            });
        });
        it('will return an object, listing all false claim verification responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('f')));
            const responses = await engine.verifyClaims(claims);
            Object.values(responses).forEach(response => {
                assert.isFalse(response)
            });
        });
        it('will return an object, listing all error claim verification responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('e_bad_request')));
            const responses = await engine.verifyClaims(claims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof BadRequest)
            });
        });
        it('will return an object, listing all undefined subject error claim verification responses', async () => {
            const claims = _.pick(testClaims, ['e_unidentified_subject']);
            const responses = await engine.verifyClaims(claims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof UnidentifiedSubjectError)
            });
        });
        it('will return an object, listing all internal error claim verification responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('e_internal')));
            const ca = new ClaimsAdjudicator(_.pick(testConcepts, ['subject_exists', 'bad_compare_favorite_color', 'bad_cast_favorite_color']));
            const responses = await ca.verifyClaims(claims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof InternalError)
            });
        });
        it('will throw a BadRequest error when claims given is not an object', async () => {
            try {
                await engine.verifyClaims('Should be an object');
            } catch (e) {
                assert.isTrue(e instanceof BadRequest);
            }
        });
    })
});
