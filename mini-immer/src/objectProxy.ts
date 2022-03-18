import {_originalKey, _originalKeyExist, Action, getProxy} from "./utils"

export class ObjectProxy<T extends object> {
  baseObj: T
  _draftObj?: T
  _revokeProxy?: { proxy: T; revoke: () => void; }
  parent?: ObjectProxy<T>
  parentAccessor?: string | number | symbol
  childrenMap: Record<string, ObjectProxy<T>>
  action?: Action

  constructor(baseObj: T) {
    this.baseObj = baseObj
    this.childrenMap = {}
  }

  proxyGet(target: T, name: string | symbol) {
    if (name === _originalKeyExist) {
      return true
    }

    if (name === _originalKey) {
      return target
    }

    const key = name as string
    if (this.childrenMap[key]) {
      return this.childrenMap[key].proxy
    }

    const value = (target as any)[name]
    if (typeof value === "object") {
      const nextProxy = getProxy(value)
      this.childrenMap[key] = nextProxy
      nextProxy.parent = this
      nextProxy.parentAccessor = name
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

  proxyDelete(target: T, name: string) {
    this.action = {name, type: "delete"}
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
        deleteProperty: this.proxyDelete.bind(this),
      })
    }

    return this._revokeProxy.proxy
  }

  copyBaseObj = (): T => ({...this.baseObj})

  revoke = () => {
    for (const child of Object.values(this.childrenMap)) {
      child.revoke()
    }
    this._revokeProxy?.revoke?.()
  }

  build = (): T => {
    const action = this.action
    if (action?.type === "set") {
      const {name, value} = action
      this.draftObj = {...this.baseObj, [name]: value}
    } else if (action?.type === "delete") {
      const {name} = action
      const {[name as keyof T]: _, ...rest} = this.baseObj
      this.draftObj = rest as any
    }


    this.action = undefined

    if (this.parent) {
      this.parent.build();
      (this.parent.draftObj as any)[this.parentAccessor!] = this.draftObj
    }

    return this.draftObj
  }
}
