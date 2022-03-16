import {ObjectProxy} from "./objectProxy"

export class ArrayProxy<T extends Array<any>> extends ObjectProxy<T> {
  copyBaseObj = (): T => [...this.baseObj] as any

  proxyGet(target: T, name: string) {
    const value = target[name as any]
    if (Array.prototype.hasOwnProperty(name)) {
      return (...args: any[]) => value.call(this.draftObj, ...args)
    }

    return ObjectProxy.prototype.proxyGet.call(this, target, name)
  }
}
