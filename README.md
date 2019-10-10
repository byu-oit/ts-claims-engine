# ts-claims-engine
##### The Claims Adjudicator Module

[![Build Status](https://travis-ci.org/byu-oit/ts-claims-engine.svg?branch=master)](https://travis-ci.org/byu-oit/ts-claims-engine)
[![Coverage Status](https://coveralls.io/repos/github/byu-oit/ts-claims-engine/badge.svg?branch=master)](https://coveralls.io/github/byu-oit/ts-claims-engine?branch=master)
![GitHub package.json version](https://img.shields.io/github/package-json/v/byu-oit/ts-claims-engine)

## Installation
`npm i @byu-oit/ts-claims-engine`

## Introduction

The Claim Adjudicator Module (CAM, aka the Claims Engine) provides a facet of the
domain contract through which other domains may verify information without having
to obtain a copy of that information. For example, in order to determine whether
a person is older than 21, many systems store that person's birth date. The CAM
enables domains to store the binary answer to the questions, "Is this person older
than 21?", instead of the more problematic date of birth.

## Terminology

* **Claim** - A subject identifier and one or more tuples defining the relationship of the value of a concept associated with the subject and a reference value
* **Concept** - A domain-specific value or state about which a claim may be validated. A concept can be anything from a single internal data element to the result of a complex internal process. That is, concepts can be more abstract than the properties associated with a domain's resources and subresources.
* **Mode** - A verb that modifies the behavior of the claim engine. Modes include ALL (the default), which requires all claims in the claim array to be true to verify the claim, and ONE, which requires only one of the claims in the claim array to be true to verify the claim.
* **Qualifier** - An optional object containing domain-specific properties that is passed to the concept resolution code to further qualify the claim.
* **Relationship** - The claimed relationship between the value of the concept for the specified subject and the reference value. Relationships include "match," "gt_or_eq-to," and "lt_or_eq-to."
* **Subject** - A domain-specific resource identifier.

## Description

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

### Qualifier

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
