export {observer} from "./mini-mobx-react"
export function makeObservable(obj: any) {
  // not use this one
}

declare global {
  interface Array<T> {
    last: () => any
  }
}

Array.prototype.last = function () {
  return this[this.length - 1]
}

export class Observer {
  static observingContextArray: Set<Observer>[] = []
  observed: Set<Observer> // this is observed by the set of Observers
  val: undefined
  callback?: () => void // for computed and autorun

  constructor(callback?: () => void) {
    this.observed = new Set<Observer>()
    this.val = undefined
    this.callback = callback
  }

  buildDependence() {
    const newObserving = new Set<Observer>()
    Observer.observingContextArray.push(newObserving)

    this.callback!()

    for (const ob of newObserving) {
      ob.observed.add(this)
    }

    Observer.observingContextArray.pop()
  }

  triggerCallback() {
    if (!this.callback) return

    const originalVal = this.val

    this.callback()

    if (originalVal !== this.val) {
      for (const ob of this.observed) {
        ob.triggerCallback()
      }
    }
  }

  static addNewObservingObserver(ob: Observer) {
    if (Observer.observingContextArray.length) {
      Observer.observingContextArray.last().add(ob)
    }
  }
}

export function observable(obj: any, prop: string): any {
  const observer = new Observer()

  return {
    get: () => {
      Observer.addNewObservingObserver(observer)

      return observer.val
    },

    set: (newVal: any) => {
      if (observer.val !== newVal) {
        observer.val = newVal
        for (const ob of observer.observed) {
          ob.triggerCallback()
        }
      }
    }
  }
}

export function computed(obj: any, prop: string, descriptor: PropertyDescriptor): any {
  if (!descriptor?.get) return descriptor

  const callback = () => {
    // @ts-ignore
    observer.val = descriptor.get.bind(obj)()
  }
  const observer = new Observer(callback)

  let triggered = false

  return {
    get: () => {
      Observer.addNewObservingObserver(observer)
      if (!triggered) {
        observer.buildDependence()
        triggered = true
      }

      return observer.val
    },
  }
}

export function autorun(f: () => void) {
  const ob = new Observer(f)
  ob.buildDependence()
}
