import {produce} from "../src"
import * as assert from "assert"

describe('testing immer', () => {
  test('produce a new object', () => {
    const a = {b: 1}
    const na = produce(a, draft => {
      draft.b = 2
    })
    assert(a !== na)
    assert(a.b === 1)
    assert(na.b === 2)
  });

  test('produce a new nested object', () => {
    const a = {b: {c: 1}, b1: {}}
    const na = produce(a, draft => {
      // console.log("##### draft.b.c: ", draft.b.c)
      draft.b.c = 2
    })

    assert(a !== na)
    assert(a.b !== na.b)
    assert(a.b1 === na.b1)
    assert(a.b.c === 1)
    assert(na.b.c === 2)
  });
});
