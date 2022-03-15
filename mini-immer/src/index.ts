
type Action = {name: string | symbol, value: any, type: "set"} | { name: string | symbol, next: ObjectProxy<any>, type: "get"}

class ObjectProxy<T extends object> {
  baseObj: T
  revokeProxy?: { proxy: T; revoke: () => void; }
  actions: Action[]
  constructor(baseObj: T) {
    this.baseObj = baseObj
    this.actions = []
    const self = this
    const handler: ProxyHandler<T> = {
      get: function(target, name) {
        const nextProxy = new ObjectProxy(target[name])
        self.actions.push({name, next: nextProxy, type: "get"})

        return nextProxy.proxy
      },

      set: function (target, name, value): boolean {
        self.actions.push({name, value, type: "set"})

        return true
      }
    }

    this.revokeProxy = Proxy.revocable<T>(baseObj, handler)
  }

  get proxy(): T {
    return this.revokeProxy.proxy
  }

  revoke = () => {

  }

  build = (): T => {
    let newObj = {...this.baseObj}
    for(const effect of this.actions) {
      if(effect.type === "set") {
        const {name, value} = effect
        newObj = {...this.baseObj, [name]: value}
      } else if(effect.type === "get") {
        const {name, next} = effect
        newObj = {...this.baseObj, [name]: next.build()}
      }
    }

    return newObj
  }
}


export function produce<T extends object>(baseObj: T, changeFunc: (d: T) => void): T {
  const proxyObj = new ObjectProxy<T>(baseObj)

  changeFunc(proxyObj.proxy)
  const newObj = proxyObj.build()

  proxyObj.revoke()

  return newObj
}
