
type Action = {name: string, value: any, type: "set"} | { name: string, next: ObjectProxy<any>, type: "get"}

class ObjectProxy<T extends object> {
  baseObj: T
  draftObj: T
  revokeProxy?: { proxy: T; revoke: () => void; }
  action?: Action
  constructor(baseObj: T) {
    this.baseObj = baseObj
    const self = this
    const handler: ProxyHandler<T> = {
      get: function(target, name: string) {
        const value = target[name]
        if(typeof value === "object") {
          const nextProxy = new ObjectProxy(target[name])

          self.action = {name, next: nextProxy, type: "get"}

          return nextProxy.proxy
        } else {
          return value
        }
      },

      set: function (target, name: string, value): boolean {
        self.action = {name, value, type: "set"}
        self.build()
        return true
      }
    }

    this.revokeProxy = Proxy.revocable<T>(baseObj, handler)
  }

  get proxy(): T {
    return this.revokeProxy.proxy
  }

  build = (): T => {
    if(this.draftObj === undefined) {
      this.draftObj = {...this.baseObj}
    }
    const action = this.action
    if(action?.type === "set") {
      const {name, value} = action
      this.draftObj = {...this.baseObj, [name]: value}
    } else if(action?.type === "get") {
      const {name, next} = action
      this.draftObj = {...this.baseObj, [name]: next.build()}
      this.revokeProxy.revoke()
    }

    this.action = undefined

    return this.draftObj
  }
}


export function produce<T extends object>(baseObj: T, changeFunc: (d: T) => void): T {
  const proxyObj = new ObjectProxy<T>(baseObj)

  changeFunc(proxyObj.proxy)
  const newObj = proxyObj.build()

  return newObj
}


export function original<T>(proxy: T): T {
  return proxy
}
