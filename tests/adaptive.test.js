import {createLocalVue, mount} from "@vue/test-utils"

import Adaptive from "../src"
import config from "./config.json"
import Test from "./test.vue"

function resizeViewport(width, height) {
  if (width) window.innerWidth = width
  if (height) window.innerHeight = height
  window.dispatchEvent(new Event("resize"))
}

function rotateDevice(duration = 500, steps = 100) {
  const widthStep = (window.innerHeight - window.innerWidth) / steps
  const heightStep = (window.innerWidth - window.innerHeight) / steps
  function orientationChange() {
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

const resizeHandleTimeout = 50
const localVue = createLocalVue()
localVue.use(Adaptive, config)

describe("Adaptive events handling", () => {
  const wrapper = mount(Test, {localVue})

  beforeEach(() => {
    resizeViewport(1024, 768)
  }, resizeHandleTimeout)

  test("Vue.adaptive should be equal to the instances $adaptive", () => {
    expect(localVue.adaptive).toEqual(wrapper.vm.$adaptive)
  })

  test("Vue.adaptive should stay equal to the instances $adaptive after resize", done => {
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
    }, resizeHandleTimeout)
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
    }, resizeHandleTimeout)
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
        }, orientationChangeDuration * 1.5)
      } catch (error) {
        done(error)
      }
    }, (1000 / 60) * 1.5)
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

describe("Adaptive breakpoint matching", () => {
  test("Adaptive should select breakpoint on dimensions match", done => {
    resizeViewport(1000, 600)
    setTimeout(() => {
      try {
        expect(localVue.adaptive.is).toEqual({
          desktop: false,
          tablet: true,
          mobile: false
        })

        expect(document.documentElement.className).toInclude("tablet")
        expect(document.documentElement.className).toIncludeMultiple([
          "no-desktop",
          "no-mobile"
        ])

        expect(document.documentElement.className).not.toInclude("no-tablet")
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should not select breakpoint on one dimension match", done => {
    function checkBreakpoints() {
      expect(localVue.adaptive.is.tablet).toBeFalse()
      expect(document.documentElement.className).toInclude("no-tablet")
    }
    resizeViewport(1000, 1000)
    setTimeout(() => {
      try {
        checkBreakpoints()
        resizeViewport(1100, 600)
        setTimeout(() => {
          try {
            checkBreakpoints()
            done()
          } catch (error) {
            done(error)
          }
        }, resizeHandleTimeout)
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should select breakpoint on exclusive lower match", done => {
    resizeViewport(1008)
    setTimeout(() => {
      try {
        expect(localVue.adaptive.is.desktop).toBeTrue()
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should select breakpoint on inclusive higher match", done => {
    resizeViewport(1440)
    setTimeout(() => {
      try {
        expect(localVue.adaptive.is.desktop).toBeFalse()
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should select breakpoint if only one of suffixed breakpoints match", done => {
    resizeViewport(1500, 768)
    setTimeout(() => {
      try {
        expect(localVue.adaptive.is.desktop).toBeTrue()
        expect(document.documentElement.className).toInclude("desktop")
        expect(document.documentElement.className).not.toInclude("no-desktop")
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should not add device classes if noDevice set to false", () => {
    expect(localVue.adaptive.is).not.toHaveProperty("body")
    expect(document.documentElement.className).not.toMatch(
      /(?:^| )(?:no-)?body(?:$| )/
    )
  })
})

describe("Adaptive rem calculation", () => {
  test("Adaptive should set static rem based on config", done => {
    resizeViewport(1500)
    setTimeout(() => {
      try {
        expect(localVue.adaptive.rem).toBe(10)
        expect(document.documentElement.style.fontSize).toBe("10px")
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should calculate rem based on base object", done => {
    const width = 1200
    resizeViewport(width)
    setTimeout(() => {
      try {
        const rem = (width / 1008) * 10 * 0.75 // device k
        expect(localVue.adaptive.rem).toBeCloseTo(rem)
        expect(parseFloat(document.documentElement.style.fontSize)).toBeCloseTo(
          rem
        )
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })

  test("Adaptive should select minimal coefficient if two bases passed", done => {
    const width = 250
    resizeViewport(width, 299)
    setTimeout(() => {
      try {
        const rem = (width / 200) * 10
        expect(localVue.adaptive.rem).toBeCloseTo(rem)
        done()
      } catch (error) {
        done(error)
      }
    }, resizeHandleTimeout)
  })
})
