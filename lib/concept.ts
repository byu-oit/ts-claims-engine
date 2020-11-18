import {Comparator} from './comparator'
import {ConceptOptions, Relationship, CastFn, GetValueFunction, Optional} from './types'
import * as cast from './casts'

export class Concept<T> implements ConceptOptions<T>{
    static Number = function (options: Optional<ConceptOptions<number>, 'compare' | 'cast'>): Concept<number> {
        return new Concept<number>({
            ...options,
            compare: options.compare || Comparator.Number,
            cast: options.cast || cast.number
        })
    }

    static String = function (options: Optional<ConceptOptions<string>, 'compare' | 'cast'>): Concept<string> {
        return new Concept<string>({
            ...options,
            compare: options.compare || Comparator.String,
            cast: options.cast || cast.string
        })
    }

    static Boolean = function (options: Optional<ConceptOptions<boolean>, 'compare' | 'cast'>): Concept<boolean> {
        return new Concept<boolean>({
            ...options,
            compare: options.compare || Comparator.Boolean,
            cast: options.cast || cast.boolean
        })
    }

    static Custom = function<T> (options: ConceptOptions<T>): Concept<T> {
        return new Concept(options)
    }

    name: string
    description: string
    longDescription?: string
    relationships: [Relationship, ...Relationship[]]
    qualifiers: string[]
    getValue: GetValueFunction<T>
    compare: Comparator<T>
    cast: CastFn<T>

    constructor(options: ConceptOptions<T>) {
        this.name = options.name
        this.description = options.description
        this.longDescription = options.longDescription
        this.relationships = options.relationships
        this.qualifiers = options.qualifiers || []
        this.getValue = options.getValue
        this.compare = !(options.compare instanceof Comparator) ? new Comparator(options.compare) : options.compare
        this.cast = options.cast
    }
}
