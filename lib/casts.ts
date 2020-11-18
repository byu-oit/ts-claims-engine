import {CastFn} from './types'

export const boolean: CastFn<boolean> = value => value === 'true'

export const number: CastFn<number> = value => Number(value)

export const string: CastFn<string> = value => value
