import {CompareFn} from './types'

export class Comparator<T> {
    static Number = new Comparator<number>((left, right) => left - right)

    static String = new Comparator<string>((left, right) => {
        if (left === right) return 0
        return left < right ? -1 : 1
    })

    static Boolean = new Comparator<boolean>((left, right) => {
        if (left === right) return 0
        return left < right ? -1 : 1
    })

    constructor(public compare: CompareFn<T>) {}

    public equal(a: T, b: T): boolean {
        return this.compare(a, b) === 0
    }

    public notEqual(a: T, b: T): boolean {
        return this.compare(a, b) !== 0
    }

    public lessThan(a: T, b: T): boolean {
        return this.compare(a, b) < 0
    }

    public greaterThan(a: T, b: T): boolean {
        return this.compare(a, b) > 0
    }

    public lessThanOrEqual(a: T, b: T): boolean {
        return this.lessThan(a, b) || this.equal(a, b)
    }

    public greaterThanOrEqual(a: T, b: T): boolean {
        return this.greaterThan(a, b) || this.equal(a, b)
    }
}
