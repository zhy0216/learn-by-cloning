import {original, produce} from "../src"
import assert from "assert"

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
      draft.b.c = 3
      draft.b.c = 2
    })

    assert(a !== na)
    assert(a.b !== na.b)
    assert(a.b1 === na.b1)
    assert(a.b.c === 1)
    assert(na.b.c === 2)
  });

  test('produce a new array', () => {
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

  test('produce original', () => {
    const a = {b: [1]}
    produce(a, draft => {
      assert(original(draft.b) === a.b)
      assert(original(draft.b[0]) === 1)
    })
  });
});
