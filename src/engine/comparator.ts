export default class Comparator<T> {
    public static defaultCompareFunction(a: any, b: any) {
        if (a === b) {
            return 0;
        }
        return a < b ? -1 : 1;
    }

    public compare: (a: T, b: T) => number;

    constructor(fn?: (a: T, b: T) => number) {
        this.compare = fn || Comparator.defaultCompareFunction;
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
