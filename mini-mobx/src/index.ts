export function makeObservable(obj: any) {

}

export class Observer {
  static newObservingArray: Set<Observer>[] = []
  observing: Set<Observer> // this is observing the set of Observers
  observed: Set<Observer> // this is observed by the set of Observers
  val: undefined
  name?: string
  callback?: () => void // for computed and autorun
  constructor(callback?: () => void, name?: string) {
    this.observing = new Set<Observer>()
    this.observed =  new Set<Observer>()
    this.val = undefined
    this.callback = callback
    this.name = name
  }

  triggerCallback(buildDependence?: boolean) {
    if(!this.callback) return
    const newObserving = Observer.getOrCreateLastNewObserving(buildDependence)
    this.callback()
    if(buildDependence) {
      for(const ob of newObserving) {
        this.observing.add(ob)
        ob.observed.add(this)
      }
    }
    Observer.newObservingArray.pop()
  }

  static getOrCreateLastNewObserving(makeNew?: boolean): Set<Observer> {
    const length = Observer.newObservingArray.length
    if(length === 0 || makeNew) {
      Observer.newObservingArray.push(new Set<Observer>())
      return Observer.newObservingArray[length]
    }
    return Observer.newObservingArray[length-1]
  }
  static addNewObservinger(ob: Observer) {
    const newObservers = Observer.getOrCreateLastNewObserving()
    newObservers.add(ob)
  }

}

export function observable(obj: any, prop: string): any {
  const observer = new Observer(undefined, prop)

  return {
    get: () => {
      Observer.addNewObservinger(observer)
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
    const value = descriptor.get.bind(obj)()
    observer.val = value
  }
  const observer = new Observer(callback, prop)
  let triggered = false

  return {
    get: () => {
      if(!triggered) {
        observer.triggerCallback(true)
        triggered = true
      }

      return observer.val
    },
  }
}

export function autorun(f: () => void) {
  const ob = new Observer(f, "autorun")
  ob.triggerCallback(true)
}
