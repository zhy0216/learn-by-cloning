import {_originalKey, _originalKeyExist, Action, getProxy} from "./utils"

export class ObjectProxy<T extends object> {
  baseObj: T
  _draftObj?: T
  _revokeProxy?: { proxy: T; revoke: () => void; }
  actions: Action[]

  constructor(baseObj: T) {
    this.baseObj = baseObj
    this.actions = []
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
      this.actions.push({name, next: nextProxy, type: "get"})
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

  build = (): T => {
    console.log([...this.actions])
    for(const action of this.actions) {
      if (action?.type === "set") {
        const {name, value} = action
        this.draftObj = {...this.baseObj, [name]: value}
      } else if (action?.type === "get") {
        const {name, next} = action
        this.draftObj = {...this.baseObj, [name]: next.build()}
      }
      this._revokeProxy?.revoke?.()
    }


    this.actions = []

    return this.draftObj
  }
}
