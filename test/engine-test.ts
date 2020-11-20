import {assert} from 'chai'
import * as _ from 'lodash'
import {
    ClaimsAdjudicator,
    Relationships,
    SubjectNotFound,
    ValidationError, ValueNotFound
} from '../lib'
import {testClaims, testConcepts} from './static'

describe('Claims Adjudicator', () => {
    let engine: ClaimsAdjudicator

    before(() => {
        const concepts = testConcepts.filter(concept => !['bad_cast_favorite_color', 'bad_compare_favorite_color'].includes(concept.name))
        engine = new ClaimsAdjudicator(concepts)
    })

    it('should throw an error when a subject_exists concept is not provided', () => {
        try {
            new ClaimsAdjudicator([])
        } catch (e) {
            assert.isTrue(true)
        }
    })

    it('should fail requests when given a faulty cast in a concept', async () => {
        const concepts = testConcepts.filter(concept => ['subject_exists', 'bad_cast_favorite_color'].includes(concept.name))
        const claims = _.pick(testClaims, ['t1', 't2'])

        const ca = new ClaimsAdjudicator(concepts)
        const responses = await ca.verifyClaims(claims)

        Object.values(responses).forEach(response => {
            assert.isTrue(response instanceof Error)
        })
    })

    describe('getConcepts', () => {
        it('will return the concepts list', () => {
            const concepts = engine.getConcepts()
            assert.isArray(concepts)

            concepts.forEach(concept => {
                assert.isString(concept.description)
                assert.isString(concept.longDescription)
                assert.isString(concept.name)
                assert.isArray(concept.qualifiers)
                concept.qualifiers.forEach(qualifier => {
                    assert.isString(qualifier)
                })
                assert.isArray(concept.relationships)
                concept.relationships.forEach(relationship => {
                    assert.isTrue(Object.values(Relationships).includes(relationship))
                })
            })
        })
    })

    describe('getConcept', () => {
        it('will return the concept when it exists', () => {
            const concept = engine.getConcept('subject_exists')
            assert.isDefined(concept)
            if (concept) {
                assert.isString(concept.description)
                assert.isString(concept.longDescription)
                assert.isString(concept.name)
                assert.isArray(concept.qualifiers)
                assert.isFunction(concept.getValue)
            }
        })
        it('will return undefined when the concept is not found', () => {
            const concept = engine.getConcept('not_test_concept')
            assert.isUndefined(concept)
        })
    })

    describe('conceptExists', () => {
        it('will return true when the concept exists', () => {
            assert.isTrue(engine.conceptExists('subject_exists'))
            assert.isTrue(engine.conceptExists('age'))
            assert.isTrue(engine.conceptExists('favorite_color'))
        })
        it('will return false when the concept does not exists', () => {
            assert.isFalse(engine.conceptExists('does_not_exist'))
        })
    })

    describe('verifyClaims', () => {
        it('will return an object, listing all true claim responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('t10')))
            const responses = await engine.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isTrue(response)
            })
        })
        it('will return an object, listing all false claim responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('f')))
            const responses = await engine.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isFalse(response)
            })
        })
        it('will return an object, listing all validation error claim responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('e_bad_request')))
            const responses = await engine.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof ValidationError)
            })
        })
        it('will return an object, with a subject not found error claim response', async () => {
            const claims = _.pick(testClaims, ['e_unidentified_subject'])
            const responses = await engine.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof SubjectNotFound)
            })
        })
        it('will return an object, with a value not found error claim response', async () => {
            const claims = _.pick(testClaims, ['e_undefined_value'])
            const responses = await engine.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof ValueNotFound)
            })
        })
        it('will return an object, listing all internal error claim verification responses', async () => {
            const claims = _.pick(testClaims, Object.keys(testClaims).filter(key => key.startsWith('e_internal')))
            const ca = new ClaimsAdjudicator(testConcepts.filter(concept => ['subject_exists', 'bad_compare_favorite_color', 'bad_cast_favorite_color'].includes(concept.name)))
            const responses = await ca.verifyClaims(claims)
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof Error)
            })
        })
    })
})
