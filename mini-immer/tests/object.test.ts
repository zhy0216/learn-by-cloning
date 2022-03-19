import {original, produce} from "../src"
import assert from "assert"

describe('testing immer', () => {
  test('produce a new object without action', () => {
    const a = {b: 1}
    const na = produce(a, draft => {
    })
    assert(a !== na)
    assert(a.b === 1)
    assert(na.b === 1)
  });

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

  test('produce original', () => {
    const a = {b: [1]}
    produce(a, draft => {
      assert(original(draft.b) === a.b)
      assert(original(draft.b[0]) === 1)
    })
  });

  test('produce with temp variable 1', () => {
    const a = {b: {c: {d: 1}}}
    const na = produce(a, draft => {
      const b = draft.b
      const c = draft.b.c
      c.d = 3
      b.c = {d: 2}
    })

    assert(a !== na)
    assert(a.b !== na.b)
    assert(a.b.c.d === 1)
    assert(na.b.c.d === 2)
  });

  test('produce with temp variable 2', () => {
    const a = {b: {c: {d: 1}}}
    const na = produce(a, draft => {
      const b = draft.b
      const c = draft.b.c
      b.c = {d: 2}
      c.d = 3
    })

    assert(a !== na)
    assert(a.b !== na.b)
    assert(a.b.c.d === 1)
    assert(na.b.c.d === 3)
  });

  test('produce with different paths', () => {
    const a = {b1: {c: 1}, b2: {c: 2}}
    const na = produce(a, draft => {
      const b1 = draft.b1
      //@ts-ignore
      const b2 = draft.b2
      b1.c = 1
      b1.c = 2
    })

    assert(a !== na)
    assert(na.b1.c === 2)
    assert(na.b2.c === 2)
  });

  test('produce a new object with delete', () => {
    const a: any = {b: 1}
    const na = produce(a, draft => {
      delete draft.b
    })
    assert(a !== na)
    assert(a.b === 1)
    assert(na.b === undefined)
  });

});
