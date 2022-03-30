export function makeObservable(obj: any) {

}

class Observer {
  static newObserverArray: Set<Observer>[] = []
  observing: Set<Observer>
  observed: Set<Observer>
  val: undefined
  callback?: () => void // for computed and autorun
  constructor(callback?: () => void) {
    this.observing = new Set<Observer>()
    this.observed =  new Set<Observer>()
    this.val = undefined
    this.callback = callback
  }

  triggerCallback() {
    if(!this.callback) return
    const newObservers = Observer.getOrCreateLastNewObserver()
    this.callback()
    for(const ob of newObservers) {
      this.observed.add(ob)
    }
    Observer.newObserverArray.pop()
  }

  static getOrCreateLastNewObserver(): Set<Observer> {
    const length = Observer.newObserverArray.length
    if(length === 0) {
      Observer.newObserverArray.push(new Set<Observer>())
      return Observer.newObserverArray[0]
    }
    return Observer.newObserverArray[length-1]
  }
  static addNewObserver(ob: Observer) {
    const newObservers = Observer.getOrCreateLastNewObserver()
    newObservers.add(ob)
  }

}

export function observable(obj: any, prop: string): any {
  const observer = new Observer()

  return {
    get: () => {
      console.log("######## im get")
      Observer.addNewObserver(observer)
      return observer.val
    },

    set: (newVal: any) => {
      console.log("######## im set")
      // const oldVal = observer.val
      observer.val = newVal
      // if (observer.val !== oldVal) {
      //   for(const ob of observer.observed) {
      //     ob.triggerCallback()
      //   }
      // }
    }
  }
}

export function computed(obj: any, prop: string, descriptor: PropertyDescriptor): any {
  if (!descriptor?.get) return descriptor

  const observer = new Observer(descriptor.get.bind(obj))
  observer.triggerCallback()
  return {
    get: () => {
      Observer.addNewObserver(observer)
      return observer.val
    },
  }
}

export function autorun(f: () => void) {
  const ob = new Observer(f)
  ob.triggerCallback()
}
