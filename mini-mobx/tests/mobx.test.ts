import assert from "assert"
// import { makeObservable, observable, computed, autorun} from "mobx";
import {makeObservable, observable, computed, autorun} from "../src";


describe('mini mobx', () => {
  test('observable', () => {
    let countIsHungry = 0
    let countAutoRun = 0

    class Animal {
      @observable name: string
      @observable energyLevel: number

      constructor(name: string) {
        makeObservable(this)

        this.name = name
        this.energyLevel = 100
      }

      @computed get isHungry() {
        countIsHungry++
        return this.energyLevel < 50
      }
    }

    const giraffe = new Animal("Gary")

    autorun(() => {
      countAutoRun ++
      if (!giraffe.isHungry) {
      } else {
      }
    })

    assert(countAutoRun === 1)
    assert(countIsHungry === 1)

    giraffe.energyLevel = 60

    // @ts-ignore
    assert(countIsHungry === 2)
    assert(countAutoRun === 1)

    giraffe.energyLevel = 40
    // @ts-ignore
    assert(countIsHungry === 3)
    // @ts-ignore
    assert(countAutoRun === 2)

  });
});
