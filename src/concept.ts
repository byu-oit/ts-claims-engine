import {ConceptOptions, GetValueFunction, Relationship} from './types';
import {Comparator} from './comparator';

export class Concept<T> {
    public readonly description: string;
    public readonly longDescription: string;
    public readonly type: string;
    public readonly relationships: Relationship[];
    public readonly qualifiers: string[];
    public readonly getValue: GetValueFunction<T>;
    public readonly compare: Comparator<T>;
    public readonly cast: (value: string) => T | string | number | boolean | undefined;

    constructor(options: ConceptOptions<T>) {
        if (!['string', 'float', 'int', 'boolean'].includes(typeof options.type) && !options.cast) {
            throw new Error('Must supply a cast function when concept type is generic.');
        }

        this.description = options.description;
        this.longDescription = options.longDescription;
        this.type = options.type;
        this.relationships = options.relationships;
        this.qualifiers = options.qualifiers || [];
        this.getValue = (subjectId, qualifiers) => {
            try {
                return options.getValue(subjectId, qualifiers);
            } catch (e) {
                throw new Error(`Error during getValue: ${e.message}.`);
            }
        };
        this.compare = new Comparator<T>(options.compare);
        this.cast = (value: string) => {
            try {
                return options.cast ? options.cast(value) : this.defaultCast(value);
            } catch (e) {
                throw new Error(`Error during casting: ${e.message}.`);
            }
        }
    }

    public defaultCast = (value: string) => {
        switch (this.type) {
            case 'string':
                return value;
            case 'float':
                return parseFloat(value);
            case 'int':
                return parseInt(value, 10);
            case 'boolean':
                return value === 'true';
        }
    };
}
