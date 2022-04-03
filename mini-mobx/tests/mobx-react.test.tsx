// import { makeObservable, observable} from "mobx";
// import { observer } from "mobx-react-lite"

import { makeObservable, observable} from "../src";
import { observer } from "../src"
import React from "react";
import {act, render} from "@testing-library/react"


test('observer', () => {
  let renders = 0
  class Store {
    @observable value = 1
    constructor() {
      makeObservable(this)
    }
  }

  const store = new Store()

  const TestComponent = observer(() => {
      renders++
      return <div>!{store.value}!</div>
  })

  const rendered = render(<TestComponent />)
  expect(renders).toBe(1)
  expect(rendered.getAllByText("!1!")).toHaveLength(1)

  act(() => {
    store.value = 2
  })

  expect(rendered.getAllByText("!2!")).toHaveLength(1)
  expect(renders).toBe(2)

})
