import {Concept} from '../src';

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

export const subjects: {
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

export const testConcepts = {
    subject_exists: new Concept({
        description: 'The subject exists',
        longDescription: 'Determines whether a subject is a known entity within the domain.',
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
        compare: (a, b) => {
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
    bad_compare_favorite_color: new Concept({
        description: 'The subject has the favorite color',
        longDescription: 'The subject considers their favorite color to be',
        type: 'string',
        relationships: ['eq', 'not_eq'],
        getValue: async (id: string) => subjects[id].favorite_color,
        compare: (a, b) => {
            throw new Error('Fake Error');
        },
    }),
    bad_cast_favorite_color: new Concept({
        description: 'The subject has the favorite color',
        longDescription: 'The subject considers their favorite color to be',
        type: 'color',
        relationships: ['eq', 'not_eq'],
        getValue: async (id: string) => subjects[id].favorite_color,
        cast: (value) => {
            throw new Error('Fake Error');
        },
    })
};

export const testClaims = {
    t1: {
        'subject': '123456789',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'eq',
                'value': 'blue'
            }
        ]
    },
    t2: {
        'subject': '123456789',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'not_eq',
                'value': 'orange'
            }
        ]
    },
    t3: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'gt',
                'value': '15'
            }
        ]
    },
    t4: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'gt_or_eq',
                'value': '16'
            }
        ]
    },
    t5: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'height',
                'relationship': 'lt_or_eq',
                'value': '6.1'
            }
        ]
    },
    t6: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'height',
                'relationship': 'lt',
                'value': '6.2'
            }
        ]
    },
    t7: {
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
    t8: {
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
    },

    f1: {
        'subject': '123456789',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'eq',
                'value': 'orange'
            }
        ]
    },
    f2: {
        'subject': '123456789',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'not_eq',
                'value': 'blue'
            }
        ]
    },
    f3: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'gt',
                'value': '16'
            }
        ]
    },
    f4: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'gt_or_eq',
                'value': '17'
            }
        ]
    },
    f5: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'lt_or_eq',
                'value': '15'
            }
        ]
    },
    f6: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'age',
                'relationship': 'lt',
                'value': '16'
            }
        ]
    },
    f7: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'subject_exists',
                'relationship': 'eq',
                'value': 'false'
            }
        ]
    },
    f8: {
        'subject': '123456987',
        'mode': 'any',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'lt',
                'value': 'red'
            }
        ]
    },

    e_unidentified_subject: {
        'subject': 'Not a subject',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': 'eq',
                'value': 'blue'
            }
        ]
    },
    e_bad_request_invalid_claim_object: 'Not a valid claim object',
    e_bad_request_invalid_claim_item: {
        'subject': '987654321',
        'claims': [
            'Not a valid claim item'
        ]
    },
    e_bad_request_undefined_relationship: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'favorite_food',
                'relationship': 'gt_or_eq', // Relationship not specified in concept
                'value': 'pizza'
            }
        ]
    },
    e_bad_request_invalid_mode: {
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
    e_bad_request_invalid_claim_array: {
        'subject': '987654321',
        'claims': 'Not a valid claim array'
    },
    e_bad_request_invalid_relationship: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'favorite_color',
                'relationship': '===', // Relationship not specified in concept
                'value': 'blue'
            }
        ]
    },
    e_bad_request_invalid_subject: {
        'subject': 987654321, // Subject must be a string
        'claims': [
            {
                'concept': 'favorite_food',
                'relationship': 'eq',
                'value': 'pizza'
            }
        ]
    },
    e_bad_request_invalid_qualifier_type: {
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
    e_bad_request_undefined_qualifier: {
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

    e_internal_bad_compare: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'bad_compare_favorite_color',
                'relationship': 'eq',
                'value': 'orange'
            }
        ]
    },
    e_internal_bad_cast: {
        'subject': '987654321',
        'claims': [
            {
                'concept': 'bad_cast_favorite_color',
                'relationship': 'eq',
                'value': 'orange'
            }
        ]
    }
};
