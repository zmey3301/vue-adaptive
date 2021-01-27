import {mount, createLocalVue} from "@vue/test-utils"

import Adaptive from "../src"
import config from "./config.json"
import Test from "./test.vue"

function resizeViewport (width, height) {
	if (width) window.innerWidth = width
	if (height) window.innerHeight = height
	window.dispatchEvent(new Event("resize"))
}

function rotateDevice (duration = 500, steps = 100) {
	const widthStep = (window.innerHeight - window.innerWidth) / steps
	const heightStep = (window.innerWidth - window.innerHeight) / steps
	function orientationChange () {
		window.innerWidth += widthStep
		window.innerHeight += heightStep
	}
	const interval = setInterval(() => {
		steps--
		if (steps > 0) orientationChange()
		else clearInterval(interval)
	}, duration / steps)
	orientationChange()
	window.dispatchEvent(new Event("orientationchange"))

}

describe("Adaptive events handling", () => {
	const localVue = createLocalVue()
	localVue.use(Adaptive, config)
	const wrapper = mount(Test, {localVue})

	beforeEach(() => {
		resizeViewport(1024, 768)
	}, 100)

	test("Vue.adaptive should be equal to the instance's $adaptive", () => {
		expect(localVue.adaptive).toEqual(wrapper.vm.$adaptive)
	})

	test("Vue.adaptive should stay equal to the instance's $adaptive after resize", done => {
		const width = 500
		resizeViewport(width)
		setTimeout(() => {
			try {
				const cond = expect(wrapper.vm.$adaptive.width)
				cond.toBe(localVue.adaptive.width)
				cond.toBe(width)
				done()
			} catch (error) {
				done(error)
			}
		}, 100)
	})

	test("Adaptive should react to resize event", done => {
		const size = 700
		resizeViewport(size, size)
		setTimeout(() => {
			try {
				expect(localVue.adaptive.width).toBe(size)
				expect(localVue.adaptive.height).toBe(size)
				done()
			} catch (error) {
				done(error)
			}
		}, 100)
	})

	test("Adaptive should process orientationchange event", done => {
		const initialWidth = localVue.adaptive.width
		const initialHeight = localVue.adaptive.height
		const orientationChangeDuration = 500
		rotateDevice(orientationChangeDuration)
		setTimeout(() => {
			try {
				const initialDimensions = [initialWidth, initialHeight]
				expect(localVue.adaptive.width).not.toBeOneOf(initialDimensions)
				expect(localVue.adaptive.height).not.toBeOneOf(initialDimensions)
				setTimeout(() => {
					try {
						expect(localVue.adaptive.width).toBeCloseTo(initialHeight)
						expect(localVue.adaptive.height).toBeCloseTo(initialWidth)
						done()
					} catch (error) {
						done(error)
					}
				},orientationChangeDuration * 1.5)
			} catch (error) {
				done(error)
			}
		}, 1000 / 60 * 1.5)
	})

	test("Adaptive should stop orientation change handle on timeout", done => {
		const initialWidth = localVue.adaptive.width
		const initialHeight = localVue.adaptive.height
		const orientationChangeDuration = 1500

		rotateDevice(orientationChangeDuration)
		setTimeout(() => {
			try {
				expect(localVue.adaptive.width).not.toBeCloseTo(initialHeight)
				expect(localVue.adaptive.height).not.toBeCloseTo(initialWidth)
				done()
			} catch (error) {
				done(error)
			}
		}, 2000)
	})
})

// TODO: add breakpoint matching and rem calculation test scopes
