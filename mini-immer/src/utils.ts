import {ObjectProxy} from "./objectProxy"
import {ArrayProxy} from "./arrayProxy"

export type Action = { name: string | symbol, value: any, type: "set" }
  | { name: string | symbol, type: "delete" }

export const getProxy = <T extends object>(obj: T): ObjectProxy<T> => {
  if (Array.isArray(obj)) {
    return new ArrayProxy(obj)
  }
  return new ObjectProxy(obj)
}

export const _originalKey = Symbol("_originalKey")
export const _originalKeyExist = Symbol("_originalKeyExist")
