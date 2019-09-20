import {ConceptOptions, Qualifiers, Relationship} from '../types';
import Comparator from './comparator';

export class Concept<T> {
    public readonly description: string;
    public readonly longDescription: string;
    public readonly type: string;
    public readonly relationships: Relationship[];
    public readonly qualifiers: string[];
    public readonly getValue: (subjectId: string, qualifiers?: Qualifiers) => Promise<T>;
    public readonly compare: Comparator<T>;
    public readonly cast: (value: string) => T | string | number | boolean;

    public defaultCast = (value: string) => {
        switch (this.type) {
            case 'string':
                return value;
            case 'float':
                return parseFloat(value);
            case 'int':
                return parseInt(value);
            case 'boolean':
                return (value.toLowerCase() === 'true') ? true : (value.toLowerCase() === 'false') ? false : value;
            default:
                return value;
        }
    };

    constructor(options: ConceptOptions<T>) {
        this.description = options.description;
        this.longDescription = options.longDescription;
        this.type = options.type;
        this.relationships = options.relationships;
        this.qualifiers = options.qualifiers || [];
        this.getValue = options.getValue;
        this.compare = new Comparator<T>(options.compare);
        this.cast = options.cast || this.defaultCast;
    }
}
