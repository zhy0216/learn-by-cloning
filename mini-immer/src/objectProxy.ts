import {_originalKey, _originalKeyExist, Action, getProxy} from "./utils"

export class ObjectProxy<T extends object> {
  baseObj: T
  _draftObj?: T
  _revokeProxy?: { proxy: T; revoke: () => void; }
  parent?: ObjectProxy<T>
  parentAccessor?: string | number | symbol
  childrenMap: Record<string, ObjectProxy<T>>
  actions: Action[]

  constructor(baseObj: T) {
    this.baseObj = baseObj
    this.actions = []
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
    if(this.childrenMap[key]) {
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
    this.actions.push({name, value, type: "set"})
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

  revoke = () => {
    for(const child of Object.values(this.childrenMap)) {
      child.revoke()
    }
    this._revokeProxy?.revoke?.()
  }

  build = (): T => {
    for(const action of this.actions) {
      if (action?.type === "set") {
        const {name, value} = action
        this.draftObj = {...this.baseObj, [name]: value}
      }
    }

    this.actions = []

    if(this.parent) {
      this.parent.build();
      (this.parent.draftObj as any)[this.parentAccessor!] = this.draftObj
    }

    return this.draftObj
  }
}
