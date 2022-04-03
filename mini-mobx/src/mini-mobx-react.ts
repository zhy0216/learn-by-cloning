import React, {ComponentType, useEffect, useState} from "react"
import {Observer} from "./index"

export const observer = <P>(component: ComponentType<P>): ComponentType<P> => {
  const observer = new Observer()
  Observer.observingContextArray.push(new Set())

  const wrappedComponent = (props: P) => {
    const [_, setState] = useState(0)
    const forUpdate = () => setState(n => n + 1)

    const element = React.createElement(component, props)
    useEffect(() => {
      const obs = Observer.observingContextArray.pop()!
      for (const ob of obs) {
        ob.observed.add(observer)
      }
      observer.callback = forUpdate
    }, [])

    return element
  }

  return wrappedComponent
}
