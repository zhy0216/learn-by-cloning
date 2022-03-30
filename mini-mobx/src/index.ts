export function makeObservable(obj: any) {
  // not use this one
}

declare global {
  interface Array<T> {
    last: () => any
  }
}

Array.prototype.last = function () {
  return this[this.length-1]
}

class Observer {
  static newObservingArray: Set<Observer>[] = []
  observed: Set<Observer> // this is observed by the set of Observers
  val: undefined
  callback?: () => void // for computed and autorun
  constructor(callback?: () => void) {
    this.observed =  new Set<Observer>()
    this.val = undefined
    this.callback = callback
  }

  triggerCallback(buildDependence?: boolean) {
    if(!this.callback) return
    const newObserving = Observer.getNewObserving()
    const originalVal = this.val

    this.callback()

    if(buildDependence) {
      for(const ob of newObserving) {
        ob.observed.add(this)
      }
    } else if (originalVal !== this.val){
      for(const ob of this.observed) {
        ob.triggerCallback()
      }
    }
    Observer.newObservingArray.pop()
  }

  static getNewObserving(): Set<Observer> {
    Observer.newObservingArray.push(new Set<Observer>())
    return Observer.newObservingArray.last()
  }

  static addNewObserver(ob: Observer) {
    if(Observer.newObservingArray.length) {
        Observer.newObservingArray.last().add(ob)
    }
  }
}

export function observable(obj: any, prop: string): any {
  const observer = new Observer(undefined)
  let triggered = false

  return {

    get: () => {
      if(!triggered) {
        Observer.addNewObserver(observer)
        triggered = true
      }
      return observer.val
    },

    set: (newVal: any) => {
      if (observer.val !== newVal) {
        observer.val = newVal
        for(const ob of observer.observed) {
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
      if(!triggered) {
        Observer.addNewObserver(observer)
        observer.triggerCallback(true)
        triggered = true
      }

      return observer.val
    },
  }
}

export function autorun(f: () => void) {
  const ob = new Observer(f)
  ob.triggerCallback(true)
}
