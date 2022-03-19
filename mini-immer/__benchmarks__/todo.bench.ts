import { benchmarkSuite } from "jest-bench";
import {produce as myProduce} from "../src"
import produce, {setUseProxies, setAutoFreeze} from "immer"

const MAX = 1000
const baseState = (new Array(MAX).fill(0)).map((_, i) => ({
	todo: "todo_" + i,
	done: false,
	someThingCompletelyIrrelevant: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
}))

setUseProxies(true)
setAutoFreeze(false)

benchmarkSuite("todo test", {
  ["mini-immer"]: () => {
    myProduce(baseState, draft => {
			for (let i = 0; i < MAX; i++) {
				draft[i].done = true
			}
		})
  },

  ["immer (proxy) - without auto freeze"]: () => {
    produce(baseState, draft => {
			for (let i = 0; i < MAX; i++) {
				draft[i].done = true
			}
		})
  },
});
