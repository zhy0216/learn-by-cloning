export function makeObservable(obj: any) {

}

class Observer {
  static newObservingArray: Set<Observer>[] = []
  observing: Set<Observer> // this is observing the set of Observers
  observed: Set<Observer> // this is observed by the set of Observers
  val: undefined
  callback?: () => void // for computed and autorun
  constructor(callback?: () => void) {
    this.observing = new Set<Observer>()
    this.observed =  new Set<Observer>()
    this.val = undefined
    this.callback = callback
  }

  triggerCallback(buildDependence?: boolean) {
    if(!this.callback) return
    const newObserving = Observer.getOrCreateLastNewObserving()
    this.callback()
    if(buildDependence) {
      for(const ob of newObserving) {
        this.observing.add(ob)
        ob.observed.add(this)
      }
    }
    Observer.newObservingArray.pop()
  }

  static getOrCreateLastNewObserving(): Set<Observer> {
    const length = Observer.newObservingArray.length
    if(length === 0) {
      Observer.newObservingArray.push(new Set<Observer>())
      return Observer.newObservingArray[0]
    }
    return Observer.newObservingArray[length-1]
  }
  static addNewObservinger(ob: Observer) {
    const newObservers = Observer.getOrCreateLastNewObserving()
    newObservers.add(ob)
  }

}

export function observable(obj: any, prop: string): any {
  const observer = new Observer()

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

  const observer = new Observer(descriptor.get.bind(obj))
  let triggered = false

  return {
    get: () => {
      if(!triggered) {
        observer.triggerCallback(true)
        triggered = true
      }
      Observer.addNewObservinger(observer)
      return observer.val
    },
  }
}

export function autorun(f: () => void) {
  const ob = new Observer(f)
  ob.triggerCallback(true)
}
