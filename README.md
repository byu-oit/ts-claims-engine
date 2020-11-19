<h1 align="center">Claims Adjudicator Module</h1>

<p align="center">
    <a href="https://github.com/byu-oit/ts-claims-engine-middleware/actions?query=workflow%3ACI">
      <img alt="CI" src="https://github.com/byu-oit/ts-claims-engine/workflows/CI/badge.svg" />
    </a>
    <a href="https://codecov.io/gh/byu-oit/ts-claims-engine">
      <img alt="Code Coverage" src="https://codecov.io/gh/byu-oit/ts-claims-engine/branch/master/graph/badge.svg" />
    </a>
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/byu-oit/ts-claims-engine" />
    <a href="https://prettier.io/"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier" /></a>
</p>

<br>

## Installation
`npm i @byu-oit/ts-claims-engine`

## Introduction

The Claim Adjudicator Module (CAM, aka the Claims Engine) provides a facet of the
domain contract through which other domains may verify information without having
to obtain a copy of that information. For example, in order to determine whether
a person is older than 21, many systems store that person's birth date. The CAM
enables domains to store the binary answer to the questions, "Is this person older
than 21?", instead of the more problematic date of birth.

### Terminology

* **Claim** - A subject identifier and one or more tuples defining the relationship of the value of a concept associated with the subject and a reference value
* **Concept** - A domain-specific value or state about which a claim may be validated. A concept can be anything from a single internal data element to the result of a complex internal process. That is, concepts can be more abstract than the properties associated with a domain's resources and subresources.
* **Mode** - A verb that modifies the behavior of the claim engine. Modes include ALL (the default), which requires all claims in the claim array to be true to verify the claim, and ONE, which requires only one of the claims in the claim array to be true to verify the claim.
* **Qualifier** - An optional object containing domain-specific properties that is passed to the concept resolution code to further qualify the claim.
* **Relationship** - The claimed relationship between the value of the concept for the specified subject and the reference value. Relationships include "match," "gt_or_eq-to," and "lt_or_eq-to."
* **Subject** - A domain-specific resource identifier.

### Description

More formally, the CAM determines whether a claimed relationship between the value
of the instance of a concept and a reference value can be verified.

One or more claims may be made in the context of a subject. A claim expression is
comprised of a subject identifier, a mode, and an array of claim tuples:

    {
      "subject": "123456789",
      "mode": "ALL",
      "claims": [
      ]
    }

The claim, "this person is older than 21," is expressed as a typed tuple:

    {
      "concept": "age",
      "relationship": "gt_or_eq",
      "value": "21"
    }

The CAM operates on domain-specific concepts. A concept may be anything from a
the value of a specific column in a row identified by the subject ID to a value
dynamically determined by a function.

In the older-than-21 example, the domain might subtract the birth date of the
subject from the current date to derive an age to compare with the reference value.

#### Qualifier

The claim tuple in the example above omitted the optional **qualifier** property.
A qualifier is an object with domain-specific properties. It is passed, along with
the subject ID to the concept resolution code to further qualify the claim.

    {
      "concept": "age",
      "relationship": "gt_or_eq",
      "value": "21",
      "qualifier": { ageMonthOffset: 5 }
    }

In this example, the ageMonthOffset qualifier asks if the person will be older
than 21 in 5 months.

## API
Some of the parameters and return types are complex objects. Instead of defining them in the method definitions, they have been defined in the [types file](lib/types.ts). Some of the more important types are defined in the [Appendix](#appendix) under [API Reference](#api-reference).

### ClaimsAdjudicator
Creates a new instance of the ClaimsAdjudicator
```ts
ClaimsAdjudicator(concepts: Concepts)
```
**IMPORTANT** One of the concepts must be the `subjectExists` concept. The `subjectExists` property can be in [any case](https://github.com/blakeembrey/change-case). However, if the key is not in `camelCase`, a copy will be added to the concepts with the key in `camelCase`. For example:
```js
const concepts = {
    subject_exists: new Concept({
        description: 'The subject exists',
        longDescription: 'Determines whether a subject is a known entity within the domain.',
        type: 'boolean',
        relationships: ['eq', 'not_eq'],
        qualifiers: ['age'],
        getValue: async (id, qualifiers) => {
            if (qualifiers && qualifiers.age) {
                return subjects[id] !== undefined && subjects[id].age === qualifiers.age
            } else {
                return subjects[id] !== undefined
            }
        }
    })
}

;(async () => {
    const engine = new ClaimsAdjudicator(concepts)
    const conceptInfo = await engine.getConcepts()
    console.log(JSON.stringify(conceptInfo, null, 2))
    
      //[
      //   {
      //     "id": "subject_exists",
      //     "description": "The subject exists",
      //     "longDescription": "Determines whether a subject is a known entity within the domain.",
      //     "type": "boolean",
      //     "relationships": [
      //       "eq",
      //       "not_eq"
      //     ],
      //     "qualifiers": [
      //       "age"
      //     ]
      //   },
      //   {
      //     "id": "subjectExists",
      //     "description": "The subject exists",
      //     "longDescription": "Determines whether a subject is a known entity within the domain.",
      //     "type": "boolean",
      //     "relationships": [
      //       "eq",
      //       "not_eq"
      //     ],
      //     "qualifiers": [
      //       "age"
      //     ]
      //   }
      // ]
})()
```

### Public Methods
`verifyClaims`: Verifies the claims body against the the concept configuration.
```ts
verifyClaims(claims: any): Promise<ClaimsResponse>
```
The claims parameter will accept any type in the function though it will throw a BadRequest Error if the structure of the claims cannot be interpreted. The correct structure is defined in the [Appendix](#appendix) under [API Reference](#api-reference).

`verifyClaim`: Verifies a single claim against the concept configuration.
```ts
verifyClaim(claim: any): Promise<boolean | InternalError | BadRequest>
```
The claim parameter will accept any type in the function though it will throw a BadRequest Error if the str

`conceptExists`: Verifies that a concept has been defined.
```ts
conceptExists(key: string): boolean
```

`getConcepts`: Retrieves only the concepts definition information. It does not retrieve the getValue function.
```ts
getConcepts(): ConceptInfo[]
```

`getConcept`: Retrieves a particular concept including the getValue function.
```ts
getConcept(key: string): Concept<any>
```


## Appendix

### API Reference
```ts
interface Claims {
	[key: string]: Claim
}

interface Claim {
	subject: string;
	mode: Mode;
	claims: Claims;
}

interface ClaimItem {
    concept: string;
    relationship: Relationship;
    value: string;
    qualifier?: Qualifiers;
}

interface Qualifiers<> {
    [key: string]: any;
}

type Relationship = 'gt' | 'gt_or_eq' | 'lt' | 'lt_or_eq' | 'eq' | 'not_eq';

type Mode = 'all' | 'any' | 'one';
```

### Related Packages
* **[Claims Adjudicator Module (CAM)](https://github.com/byu-oit/ts-claims-engine)**
* **[Claims Adjudicator Middleware](https://github.com/byu-oit/ts-claims-engine-middleware)**
* **[Claims Adjudicator Client](https://github.com/byu-oit/ts-claims-engine-client)**
* **[Claims Adjudicator WSO2 Request](https://github.com/byu-oit/ts-wso2-claims-request)**
