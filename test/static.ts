import {Claims, Concept, Modes, Relationships} from '../lib'

class Food {
    public name: string

    constructor(name: string) {
        this.name = name
    }
}

class Sex {
    public value: string

    constructor(value: string) {
        value = value.toLowerCase()
        if (!['m', 'f'].includes(value)) throw new TypeError(`Invalid sex ${value}`)
        this.value = value
    }
}

export const subjects: {
    [key: string]: {
        name: string
        surname?: string
        age: number
        birth_date: string
        height: number
        favorite_color: string
        favorite_food: Food
        sex: Sex
    }
} = {
    '123456789': {
        name: 'Joe',
        surname: 'Fabio',
        age: 23,
        birth_date: '1995-10-23',
        height: 5.5,
        favorite_color: 'blue',
        favorite_food: new Food('pizza'),
        sex: new Sex('f')
    },
    '987654321': {
        name: 'Bill',
        surname: 'White',
        age: 16,
        birth_date: '2000-07-11',
        height: 6.1,
        favorite_color: 'green',
        favorite_food: new Food('salad'),
        sex: new Sex('m')
    },
    '123456987': {
        name: 'Lacey',
        age: 25,
        birth_date: '1993-09-10',
        height: 5.8,
        favorite_color: 'red',
        favorite_food: new Food('ice cream'),
        sex: new Sex('f')
    }
}

export const testConcepts = [
    Concept.Boolean({
        name: 'subject_exists',
        description: 'The subject exists',
        longDescription: 'Determines whether a subject is a known entity within the domain.',
        relationships: [Relationships.EQ, Relationships.NE],
        qualifiers: ['age'],
        getValue: async (id: string, qualifiers) => {
            if (qualifiers && qualifiers.age) {
                return subjects[id] !== undefined && subjects[id].age === qualifiers.age
            } else {
                return subjects[id] !== undefined
            }
        }
    }),
    Concept.Number({
        name: 'age',
        description: 'The subject is of age',
        longDescription: 'Determine if the subject is of an age',
        relationships: [Relationships.GT, Relationships.GTE, Relationships.LT, Relationships.LTE, Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].age
    }),
    Concept.Number({
        name: 'height',
        description: 'The subject\'s height',
        longDescription: 'The subject\'s measured height in feet',
        relationships: [Relationships.GT, Relationships.GTE, Relationships.LT, Relationships.LTE, Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].height
    }),
    Concept.String({
        name: 'favorite_color',
        description: 'The subject has the favorite color',
        longDescription: 'The subject considers their favorite color to be',
        relationships: [Relationships.GT, Relationships.GTE, Relationships.LT, Relationships.LTE, Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].favorite_color,
        compare: (a, b) => {
            const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
            return colors.indexOf(b) - colors.indexOf(a)
        }
    }),
    Concept.String({
        name: 'name',
        description: 'The subject has the name',
        longDescription: 'The subjects has the name',
        relationships: [Relationships.GT, Relationships.GTE, Relationships.LT, Relationships.LTE, Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].name
    }),
    Concept.String({
        name: 'surname',
        description: 'The subject has the surname',
        longDescription: 'The subjects has the surname',
        relationships: [Relationships.GT, Relationships.GTE, Relationships.LT, Relationships.LTE, Relationships.EQ, Relationships.NE, Relationships.DE, Relationships.UN],
        getValue: async (id: string) => subjects[id].surname
    }),
    Concept.Custom<Food>({
        name: 'favorite_food',
        description: 'The subject has the favorite food',
        longDescription: 'The subject considers their favorite food to be',
        relationships: [Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].favorite_food,
        compare: (a, b) => {
            const colors = ['pizza', 'ice cream', 'salad']
            return colors.indexOf(b.name) - colors.indexOf(a.name)
        },
        cast: value => new Food(value)
    }),
    Concept.Custom<Sex>({
        name: 'sex',
        description: 'The subject is of the sex',
        longDescription: 'The subject is biologically considered',
        relationships: [Relationships.EQ, Relationships.NE],
        async getValue (id: string) { return subjects[id].sex },
        compare () { return 0 },
        cast (value) { return new Sex(value) }
    }),
    Concept.String({
        name: 'bad_compare_favorite_color',
        description: 'The subject has the favorite color',
        longDescription: 'The subject considers their favorite color to be',
        relationships: [Relationships.EQ, Relationships.NE],
        async getValue () { return '' },
        compare () { throw new Error('Fake Error') },
    }),
    Concept.String({
        name: 'bad_cast_favorite_color',
        description: 'The subject has the favorite color',
        longDescription: 'The subject considers their favorite color to be',
        relationships: [Relationships.EQ, Relationships.NE],
        getValue: async (id: string) => subjects[id].favorite_color,
        cast () { throw new Error('Fake Error') }
    })
]

export const testClaims: Claims = {
    t1: {
        subject: '123456789',
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.EQ,
                value: 'blue'
            }
        ]
    },
    t2: {
        subject: '123456789',
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.NE,
                value: 'orange'
            }
        ]
    },
    t3: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.GT,
                value: '15'
            }
        ]
    },
    t4: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.GTE,
                value: '16'
            }
        ]
    },
    t5: {
        subject: '987654321',
        claims: [
            {
                concept: 'height',
                relationship: Relationships.LTE,
                value: '6.1'
            }
        ]
    },
    t6: {
        subject: '987654321',
        claims: [
            {
                concept: 'height',
                relationship: Relationships.LT,
                value: '6.2'
            }
        ]
    },
    t7: {
        subject: '123456987',
        mode: Modes.ANY,
        claims: [
            {
                concept: 'favorite_food',
                relationship: Relationships.EQ,
                value: 'ice cream'
            }
        ]
    },
    t8: {
        subject: '123456987',
        mode: Modes.ANY,
        claims: [
            {
                concept: 'subject_exists',
                relationship: Relationships.EQ,
                qualifier: {
                    'age': 25
                },
                value: 'true'
            }
        ]
    },
    t9: {
        subject: '123456987',
        mode: Modes.ALL,
        claims: [
            {
                concept: 'name',
                relationship: Relationships.GT,
                value: 'Alpha'
            },
            {
                concept: 'name',
                relationship: Relationships.LT,
                value: 'Omega'
            }
        ]
    },
    t10: {
        subject: '123456987',
        mode: Modes.ALL,
        claims: [
            {
                concept: 'surname',
                relationship: Relationships.UN
            }
        ]
    },

    f1: {
        subject: '123456789',
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.EQ,
                value: 'orange'
            }
        ]
    },
    f2: {
        subject: '123456789',
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.NE,
                value: 'blue'
            }
        ]
    },
    f3: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.GT,
                value: '16'
            }
        ]
    },
    f4: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.GTE,
                value: '17'
            }
        ]
    },
    f5: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.LTE,
                value: '15'
            }
        ]
    },
    f6: {
        subject: '987654321',
        claims: [
            {
                concept: 'age',
                relationship: Relationships.LT,
                value: '16'
            }
        ]
    },
    f7: {
        subject: '987654321',
        claims: [
            {
                concept: 'subject_exists',
                relationship: Relationships.EQ,
                value: 'false'
            }
        ]
    },
    f8: {
        subject: '123456987',
        mode: Modes.ANY,
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.LT,
                value: 'red'
            }
        ]
    },
    f9: {
        subject: '123456987',
        mode: Modes.ALL,
        claims: [
            {
                concept: 'name',
                relationship: Relationships.GT,
                value: 'Omega'
            },
            {
                concept: 'name',
                relationship: Relationships.LT,
                value: 'Alpha'
            }
        ]
    },
    f10: {
        subject: '123456987',
        mode: Modes.ALL,
        claims: [
            {
                concept: 'surname',
                relationship: Relationships.DE,
            }
        ]
    },

    e_unidentified_subject: {
        subject: 'Not a subject',
        claims: [
            {
                concept: 'favorite_color',
                relationship: Relationships.EQ,
                value: 'blue'
            }
        ]
    },
    e_undefined_value: {
        subject: '123456987',
        claims: [
            {
                concept: 'surname',
                relationship: Relationships.LT,
                value: 'Alpha'
            }
        ]
    },
    e_bad_request_undefined_relationship: {
        subject: '987654321',
        claims: [
            {
                concept: 'favorite_food',
                relationship: Relationships.GTE, // Relationship not specified in concept
                value: 'pizza'
            }
        ]
    },
    e_bad_request_undefined_qualifier: {
        subject: '987654321',
        claims: [
            {
                concept: 'subject_exists',
                relationship: Relationships.EQ,
                qualifier: {
                    height: 6.1
                },
                value: 'pizza'
            }
        ]
    },

    e_internal_bad_compare: {
        subject: '987654321',
        claims: [
            {
                concept: 'bad_compare_favorite_color',
                relationship: Relationships.EQ,
                value: 'orange'
            }
        ]
    },
    e_internal_bad_cast: {
        subject: '987654321',
        claims: [
            {
                concept: 'bad_cast_favorite_color',
                relationship: Relationships.EQ,
                value: 'orange'
            }
        ]
    }
}
