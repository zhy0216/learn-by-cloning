type Action = { name: string | symbol, value: any, type: "set" } |
  { name: string | symbol, next: ObjectProxy<any>, type: "get" }

const getProxy = <T extends object>(obj: T): ObjectProxy<T> => {
  if (Array.isArray(obj)) {
    return new ArrayProxy(obj)
  }
  return new ObjectProxy(obj)
}

const _originalKey = Symbol("_originalKey")
const _originalKeyExist = Symbol("_originalKeyExist")

class ObjectProxy<T extends object> {
  baseObj: T
  _draftObj?: T
  _revokeProxy?: { proxy: T; revoke: () => void; }
  action?: Action

  constructor(baseObj: T) {
    this.baseObj = baseObj
  }

  proxyGet(target: T, name: string | symbol) {
    if (name === _originalKeyExist) {
      return true
    }

    if (name === _originalKey) {
      return target
    }

    const value = (target as any)[name]
    if (typeof value === "object") {
      const nextProxy = getProxy(value)
      this.action = {name, next: nextProxy, type: "get"}

      return nextProxy.proxy
    } else {
      return value
    }
  }

  proxySet(target: T, name: string, value: any) {
    this.action = {name, value, type: "set"}
    this.build()

    return true
  }

  get draftObj(): T {
    if (!this._draftObj) {
      this._draftObj = this.copyBaseObj()
    }

    return this._draftObj!
  }

  set draftObj(obj) {
    this._draftObj = obj
  }

  get proxy(): T {
    if (!this._revokeProxy) {
      this._revokeProxy = Proxy.revocable<T>(this.baseObj, {
        get: this.proxyGet.bind(this),
        set: this.proxySet.bind(this),
      })
    }

    return this._revokeProxy.proxy
  }

  copyBaseObj = (): T => ({...this.baseObj})

  build = (): T => {
    const action = this.action

    if (action?.type === "set") {
      const {name, value} = action
      this.draftObj = {...this.baseObj, [name]: value}
    } else if (action?.type === "get") {
      const {name, next} = action
      this.draftObj = {...this.baseObj, [name]: next.build()}
      this._revokeProxy?.revoke?.()
    }

    this.action = undefined

    return this.draftObj
  }
}

class ArrayProxy<T extends Array<any>> extends ObjectProxy<T> {
  copyBaseObj = (): T => [...this.baseObj] as any

  proxyGet(target: T, name: string) {
    const value = target[name as any]
    if (Array.prototype.hasOwnProperty(name)) {
      return (...args: any[]) => value.call(this.draftObj, ...args)
    }

    return ObjectProxy.prototype.proxyGet.call(this, target, name)
  }
}

export function produce<T extends object>(baseObj: T, changeFunc: (d: T) => void): T {
  const proxyObj = getProxy(baseObj)
  changeFunc(proxyObj.proxy)

  return proxyObj.build()
}

export function original<T>(proxy: T): T {
  // @ts-ignore
  if (proxy[_originalKeyExist]) {
    // @ts-ignore
    return proxy[_originalKey]
  }

  return proxy
}
