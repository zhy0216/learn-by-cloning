import {produce} from "../src"
import assert from "assert"

describe('testing immer', () => {
  test('produce a new array without ops', () => {
    const a = [1]
    const na = produce(a, draft => {
    })
    assert(a !== na)
    assert(a.length === 1)
    assert(a[0] === 1)
    assert(na.length === 1)
    assert(na[0] === 1)
  });

  test('produce a new array by changing value', () => {
    const a = [1]
    const na = produce(a, draft => {
      draft[0] = 2
    })
    assert(a !== na)
    assert(a.length === 1)
    assert(a[0] === 1)
    assert(na.length === 1)
    assert(na[0] === 2)
  });

  test('produce a new array by pushing', () => {
    const a = {b: [1]}
    const na = produce(a, draft => {
      draft.b.push(2)
    })
    assert(a !== na)
    assert(a.b.length === 1)
    assert(a.b[0] === 1)
    assert(na.b.length === 2)
    assert(na.b[1] === 2)
  });
});
