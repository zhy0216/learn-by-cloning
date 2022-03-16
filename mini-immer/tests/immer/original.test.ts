import {produce, original} from "../../src"

describe("original", () => {
	const baseState: any = {
		a: [],
		b: {}
	}

	it("should return the original from the draft", () => {

		produce(baseState, draftState => {
			expect(original(draftState)).toBe(baseState)
			expect(original(draftState.a)).toBe(baseState.a)
			expect(original(draftState.b)).toBe(baseState.b)
		})

	})

	it("should return the original from the proxy", () => {
		produce(baseState, draftState => {
			expect(original(draftState)).toBe(baseState)
			expect(original(draftState.a)).toBe(baseState.a)
			expect(original(draftState.b)).toBe(baseState.b)
		})
	})

	it("should throw undefined for new values on the draft", () => {
		produce(baseState, draftState => {
			draftState.c = {}
			draftState.d = 3
			expect(() => original(draftState.c)).toThrow()
			expect(() => original(draftState.d)).toThrow()
		})
	})
})
