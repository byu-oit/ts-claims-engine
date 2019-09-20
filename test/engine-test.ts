import {assert} from 'chai';
import {BadRequest, ClaimsAdjudicator, Concept, InternalError} from '../src';

describe('Claims Adjudicator', () => {
    class Food {
        public name: string;

        constructor(name: string) {
            this.name = name;
        }
    }

    class Sex {
        public value: string;

        constructor(value: 'm' | 'f') {
            this.value = value;
        }
    }

    const subjects: {
        [key: string]: {
            age: number;
            birth_date: string;
            height: number;
            favorite_color: string;
            favorite_food: Food;
            sex: Sex;
        }
    } = {
        '123456789': {
            age: 23,
            birth_date: '1995-10-23',
            height: 5.5,
            favorite_color: 'blue',
            favorite_food: new Food('pizza'),
            sex: new Sex('f')
        },
        '987654321': {
            age: 16,
            birth_date: '2000-07-11',
            height: 6.1,
            favorite_color: 'green',
            favorite_food: new Food('salad'),
            sex: new Sex('m')
        },
        '123456987': {
            age: 25,
            birth_date: '1993-09-10',
            height: 5.8,
            favorite_color: 'red',
            favorite_food: new Food('ice cream'),
            sex: new Sex('f')
        }
    };

    const completeConcepts = {
        subject_exists: new Concept({
            description: 'The subject exists',
            longDescription: 'Determines whether a subject is a known entity within the domain',
            type: 'boolean',
            relationships: ['eq', 'not_eq'],
            qualifiers: ['age'],
            getValue: async (id: string, qualifiers) => {
                if (qualifiers && qualifiers.age) {
                    return subjects[id] !== undefined && subjects[id].age === qualifiers.age
                } else {
                    return subjects[id] !== undefined
                }
            }
        }),
        age: new Concept({
            description: 'The subject is of age',
            longDescription: 'Determine if the subject is of an age',
            type: 'int',
            relationships: ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].age
        }),
        height: new Concept({
            description: 'The subject\'s height',
            longDescription: 'The subject\'s measured height in feet',
            type: 'float',
            relationships: ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].height
        }),
        favorite_color: new Concept({
            description: 'The subject has the favorite color',
            longDescription: 'The subject considers their favorite color to be',
            type: 'string',
            relationships: ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].favorite_color,
            compare: (a: string, b: string) => {
                const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
                return colors.indexOf(b) - colors.indexOf(a);
            },
        }),
        favorite_food: new Concept({
            description: 'The subject has the favorite food',
            longDescription: 'The subject considers their favorite food to be',
            type: 'food', // Some Generic Type
            relationships: ['eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].favorite_food,
            compare: (a: Food, b: Food) => {
                const colors = ['pizza', 'ice cream', 'salad'];
                return colors.indexOf(b.name) - colors.indexOf(a.name);
            },
            cast: value => new Food(value)
        }),
        sex: new Concept({
            description: 'The subject is of the sex',
            longDescription: 'The subject is biologically considered',
            type: 'sex', // Some Generic Type
            relationships: ['eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].sex,
            compare: (a: Sex, b: Sex) => {
                return 0;
            },
        }),
    };
    const incompleteConcepts = {
        age: new Concept({
            description: 'The subject is of age',
            longDescription: 'Determine if the subject is of an age',
            type: 'int',
            relationships: ['gt', 'gt_or_eq', 'lt', 'lt_or_eq', 'eq', 'not_eq'],
            getValue: async (id: string) => subjects[id].age
        }),
    };

    const trueClaims = {
        '1': {
            'subject': '123456789',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'eq',
                    'value': 'blue'
                }
            ]
        },
        '2': {
            'subject': '123456789',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'not_eq',
                    'value': 'orange'
                }
            ]
        },
        '3': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'gt',
                    'value': '15'
                }
            ]
        },
        '4': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'gt_or_eq',
                    'value': '16'
                }
            ]
        },
        '5': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'height',
                    'relationship': 'lt_or_eq',
                    'value': '6.1'
                }
            ]
        },
        '6': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'height',
                    'relationship': 'lt',
                    'value': '6.2'
                }
            ]
        },
        '7': {
            'subject': '123456987',
            'mode': 'any',
            'claims': [
                {
                    'concept': 'favorite_food',
                    'relationship': 'eq',
                    'value': 'ice cream'
                }
            ]
        },
        '8': {
            'subject': '123456987',
            'mode': 'any',
            'claims': [
                {
                    'concept': 'subject_exists',
                    'relationship': 'eq',
                    'qualifier': {
                        'age': 25
                    },
                    'value': 'true'
                }
            ]
        }

    };
    const falseClaims = {
        '1': {
            'subject': '123456789',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'eq',
                    'value': 'orange'
                }
            ]
        },
        '2': {
            'subject': '123456789',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'not_eq',
                    'value': 'blue'
                }
            ]
        },
        '3': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'gt',
                    'value': '16'
                }
            ]
        },
        '4': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'gt_or_eq',
                    'value': '17'
                }
            ]
        },
        '5': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'lt_or_eq',
                    'value': '15'
                }
            ]
        },
        '6': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'lt',
                    'value': '16'
                }
            ]
        },
        '7': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'subject_exists',
                    'relationship': 'eq',
                    'value': 'false'
                }
            ]
        },
        '8': {
            'subject': '123456987',
            'mode': 'any',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'lt',
                    'value': 'red'
                }
            ]
        }
    };
    const errorClaims = {
        '1': {
            'subject': 'Not a subject',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': 'eq',
                    'value': 'blue'
                }
            ]
        },
        '2': 'Not a valid claim object',
        '3': {
            'subject': '987654321',
            'claims': [
                'Not a valid claim item'
            ]
        },
        '4': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'favorite_food',
                    'relationship': 'gt_or_eq', // Relationship not specified in concept
                    'value': 'pizza'
                }
            ]
        },
        '5': {
            'subject': '987654321',
            'mode': 'Not a valid mode',
            'claims': [
                {
                    'concept': 'age',
                    'relationship': 'eq',
                    'value': '16'
                }
            ]
        },
        '6': {
            'subject': '987654321',
            'claims': 'Not a valid claim array'
        },
        '7': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'favorite_color',
                    'relationship': '===', // Relationship not specified in concept
                    'value': 'blue'
                }
            ]
        },
        '8': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'sex',
                    'relationship': 'eq',
                    'value': 'm' // No cast for this value
                }
            ]
        },
        '9': {
            'subject': 987654321, // Subject must be a string
            'claims': [
                {
                    'concept': 'favorite_food',
                    'relationship': 'eq',
                    'value': 'pizza'
                }
            ]
        },
        '10': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'subject_exists',
                    'relationship': 'eq',
                    'qualifier': 'Qualifiers must be an object with key-value pairs',
                    'value': 'true'
                }
            ]
        },
        '11': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'subject_exists',
                    'relationship': 'eq',
                    'qualifier': {
                        'height': 6.1
                    },
                    'value': 'pizza'
                }
            ]
        },
        '12': {
            'subject': '987654321',
            'claims': [
                {
                    'concept': 'subject_exists',
                    'relationship': 'eq',
                    'qualifier': {
                        'height': 6.1
                    },
                    'value': 'pizza'
                }
            ]
        }
    };

    let engine: ClaimsAdjudicator;

    it('should fail when a faulty configuration is given to the ClaimsAdjudicator', () => {
        try {
            new ClaimsAdjudicator(incompleteConcepts);
        } catch (e) {
            assert.isTrue(e instanceof InternalError);
        }
    });

    beforeEach(() => {
        engine = new ClaimsAdjudicator(completeConcepts);
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
            const responses = await engine.verifyClaims(trueClaims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response)
            });
        });
        it('will return an object, listing all false claim verification responses', async () => {
            const responses = await engine.verifyClaims(falseClaims);
            Object.values(responses).forEach(response => {
                assert.isFalse(response)
            });
        });
        it('will return an object, listing all error claim verification responses', async () => {
            const responses = await engine.verifyClaims(errorClaims);
            Object.values(responses).forEach(response => {
                assert.isTrue(response instanceof Error)
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
