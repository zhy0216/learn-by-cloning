import { benchmarkSuite } from "jest-bench";
import {produce as myProduce} from "../src"
import produce, {setUseProxies, setAutoFreeze} from "immer"

const MAX = 1000
function createTestObject() {
	return {
		a: 1,
		b: "Some data here"
	}
}

function createBaseState(): {ids: number[], map: any} {
	return {
		ids: [],
		map: Object.create(null)
	}
}

setUseProxies(true)
setAutoFreeze(false)

benchmarkSuite("incremental test", {
  ["mini-immer"]: () => {
    for (let i = 0; i < MAX; i++) {
			myProduce(createBaseState(), draft => {
				draft.ids.push(i)
				draft.map[i] = createTestObject()
			})
		}
  },
  ["immer (proxy) - without auto freeze"]: () => {
    for (let i = 0; i < MAX; i++)
      produce(createBaseState(), draft => {
				draft.ids.push(i)
				draft.map[i] = createTestObject()
			})
  },
});
