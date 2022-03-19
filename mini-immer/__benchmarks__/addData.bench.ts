import { benchmarkSuite } from "jest-bench";
import {produce as myProduce} from "../src"
import produce, {setUseProxies, setAutoFreeze} from "immer"

const dataSet = require("./data.json")
const baseState = {
	data: null
}
const MAX = 10000

setUseProxies(true)
setAutoFreeze(false)

benchmarkSuite("add data test", {
  ["mini-immer"]: () => {
    for (let i = 0; i < MAX; i++)
      myProduce(baseState, draft => {
        draft.data = dataSet
      })
  },
  ["immer (proxy) - without auto freeze"]: () => {
    for (let i = 0; i < MAX; i++)
      produce(baseState, draft => {
        draft.data = dataSet
      })
  },
});
