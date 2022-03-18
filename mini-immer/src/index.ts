import {getProxy, _originalKeyExist, _originalKey} from "./utils"

export function produce<T extends object>(baseObj: T, changeFunc: (d: T) => void): T {
  const proxyObj = getProxy(baseObj)
  changeFunc(proxyObj.proxy)

  const result = proxyObj.draftObj!
  proxyObj.revoke()

  return result
}

export function original<T>(proxy: T): T {
  // @ts-ignore
  if (proxy[_originalKeyExist]) {
    // @ts-ignore
    return proxy[_originalKey]
  }

  return proxy
}
