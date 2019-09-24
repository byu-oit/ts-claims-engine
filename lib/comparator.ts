import {NumberCompareFn} from './types';

export class Comparator<T> {
    public static defaultCompareFunction(left: any, right: any) {
        if (left === right) {
            return 0;
        }
        return left < right ? -1 : 1;
    }

    public compare: NumberCompareFn<T>;

    constructor(fn?: NumberCompareFn<T>) {
        this.compare = (left, right) => {
            try {
                return fn ? fn(left, right) : Comparator.defaultCompareFunction(left, right);
            } catch (e) {
                throw new Error(`Error in the compare function: ${e.message}.`);
            }
        };
    }

    public equal(a: T, b: T) {
        return this.compare(a, b) === 0;
    }

    public notEqual(a: T, b: T) {
        return this.compare(a, b) !== 0;
    }

    public lessThan(a: T, b: T) {
        return this.compare(a, b) < 0;
    }

    public greaterThan(a: T, b: T) {
        return this.compare(a, b) > 0;
    }

    public lessThanOrEqual(a: T, b: T) {
        return this.lessThan(a, b) || this.equal(a, b);
    }

    public greaterThanOrEqual(a: T, b: T) {
        return this.greaterThan(a, b) || this.equal(a, b);
    }
}
