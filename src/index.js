import ClassList from "classlist"
/**************************************************************************************************
 * Copyright © 2017-2020 Mikhail Perelygin <zmey3301@gmail.com>. All rights reserved.             *
 * Huge thanks to:                                                                                *
 *     Sergey Koshevarov <gondragos@gmail.com> for plugin idea;                                   *
 *     Maxim Logvinov <skovorodker.rekdo@gmail.com> for optimisation ideas;                       *
 * Program is distributed under the terms of the GNU Affero General Public License.               *
 *                                                                                                *
 * @date        17.8.2020                                                                         *
 * @license     AGPL-3.0-or-later                                                                 *
 **************************************************************************************************/
import throttle from "lodash.throttle"

export default class Adaptive {
  /**
   * Viewport describing object
   * @typedef viewport
   * @type {object} - viewport size
   * @property {number} width - viewport width
   * @property {number} height - viewport height
   */

  /**
   * Device configuration object
   * @typedef device
   * @type {object}
   * @property {function({width: number, height: number})} [if] - custom device condition callback
   * @property {string|HTMLElement} [element=window] - element selector that will be used for detecting viewport
   * @property {number} [rem] - static rem value, overrides k and base calculation
   * @property {number} [k=1] - Additional coefficient for rem calculation
   * @property {viewport} [base] - base width and height for rem calculation
   * @property {viewport} [from] - minimal width and height for setting device
   * @property {viewport} [to] - maximal width and height for setting device
   * @property {boolean} [setDevice=true] - class, no-class and device set toggle
   */

  /**
   * Plugin configuration object
   * @typedef globalConf
   * @type {object}
   * @property {number} [throttle=17] - frequency of viewport data update
   * @property {number} [orientationTestCount=50] - orientationchange event end detection tries
   * @property {number} [orientationChangeTimeout=1000] - maximum orientationchange event duration before viewport update
   */

  /**
   * Vue plugin install function
   * @param Vue - Vue framework object
   * @param {{string: device}} config - adaptive configuration file
   * @param {globalConf} config.global - Plugin's instance-level config
   */
  static install(Vue, config) {
    const adaptive = new this(Vue, config)
    Vue.adaptive = adaptive
    Object.defineProperty(Vue.prototype, "$adaptive", {
      /**
       * Adaptive current state getter
       * @returns {Adaptive} - Adaptive current state observable
       */
      get: () => adaptive
    })
  }

  /**
   * Splitting configuration and creating eventListeners
   * @param Vue - Vue framework object
   * @param {{string: device}} config - adaptive configuration file
   * @param {globalConf} config.global - Plugin's instance-level config
   * @returns {Record<string, >} - reactive model, based on Vue
   */
  constructor(Vue, config) {
    // Defaults
    const defaultGlobal = {
      throttle: 17,
      orientationTestCount: 25,
      orientationChangeTimeout: 1000
    }
    const defaultConfig = {
      if: null,
      element: window,
      rem: null,
      from: null,
      to: null,
      base: null,
      k: 1,
      setDevice: true
    }
    // Global config
    this.globals = Object.assign(defaultGlobal, config.global)
    delete config.global
    const deviceList = {}
    for (let device in config) {
      if (config.hasOwnProperty(device)) {
        const deviceConfig = (config[device] = Object.assign(
          {},
          defaultConfig,
          config[device]
        ))

        device = device.split(":")[0]
        if (deviceConfig.setDevice && !deviceList.hasOwnProperty(device))
          deviceList[device] = false
      }
    }
    this.config = config
    const data = {
      is: deviceList,
      width: 0,
      height: 0,
      rem: 0
    }
    const vueVersionArray = Vue.version.split(".")
    /**
     * Current adaptive data
     * @type {object}
     * @property {object.<string,boolean>} is - devices status
     * @property {number} width - current viewport width
     * @property {number} height - current viewport height
     * @property {number} rem - current rem size in px
     */
    this.data =
      vueVersionArray[0] === 2 && vueVersionArray[1] >= 6
        ? Vue.observable(data)
        : new Vue({data}).$data

    // Listening to change events
    window.addEventListener(
      "resize",
      throttle(this.resize.bind(this), this.globals.throttle)
    )
    window.addEventListener(
      "orientationchange",
      this.orientationChange.bind(this)
    )
    // Initializing Adaptive
    this.resize()

    return this.data
  }

  /**
   * Handle resize of viewport
   */
  resize() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    const cache = {
      keys: [window],
      values: [viewport]
    }
    const newDeviceList = {}
    let rem = 10
    // Setting viewport size
    if (this.data.width !== viewport.width) this.data.width = viewport.width
    if (this.data.height !== viewport.height) this.data.height = viewport.height

    for (let name in this.config) {
      if (this.config.hasOwnProperty(name)) {
        const device = this.config[name]
        // Getting device name
        name = name.split(":")[0]
        // Caching elements viewport
        const elementCacheIndex = cache.keys.indexOf(device.element)
        let data
        if (elementCacheIndex === -1) {
          const el =
            device.element instanceof HTMLElement
              ? device.element
              : document.querySelector(device.element)
          const clientRect = el.getBoundingClientRect()
          data = {
            width: clientRect.width,
            height: clientRect.height
          }
          cache.keys.push(device.element)
          cache.values.push(data)
        } else data = cache.values[elementCacheIndex]
        // Detecting is breakpoints valid
        // Testing if function
        const checked = !(
          (typeof device.if === "function" && !device.if(data)) ||
          // Testing min viewport
          (device.from &&
            (device.from.width > data.width ||
              device.from.height > data.height)) ||
          // Testing max viewport
          (device.to &&
            (device.to.width <= data.width || device.to.height <= data.height))
        )
        // Testing classes
        if (device.setDevice && !newDeviceList[name])
          newDeviceList[name] = checked
        // Scale changing
        if (checked) {
          // Setting static rem
          if (device.rem) {
            rem = device.rem
            // Setting dynamic rem
          } else if (device.base) {
            const remBases = []
            if (device.base.width) {
              remBases.push(data.width / device.base.width)
            }
            if (device.base.height) {
              remBases.push(data.height / device.base.height)
            }
            const remBase = Math.min(...remBases)
            rem = remBase * device.k * 10
          }
        }
      }
    }

    this.updateDOM(newDeviceList, rem)
  }

  /**
   * Update documentElement classes and font size
   * @param {object.<string,boolean>} newDeviceList - new devices state
   * @param {number} rem - new rem size calculation
   */
  updateDOM(newDeviceList, rem) {
    const documentElementClassList = new ClassList(document.documentElement)

    for (const name in newDeviceList) {
      if (newDeviceList.hasOwnProperty(name)) {
        const checked = newDeviceList[name]
        const oldClass = this.data.is[name] ? name : `no-${name}`
        const newClass = checked ? name : `no-${name}`
        // Updating classes if changed
        if (
          oldClass !== newClass ||
          !documentElementClassList.contains(newClass)
        ) {
          if (documentElementClassList.contains(oldClass))
            documentElementClassList.remove(oldClass)
          documentElementClassList.add(newClass)
          this.data.is[name] = checked
        }
      }
    }
    if (rem !== this.data.rem) {
      document.documentElement.style.fontSize = `${rem}px`
      this.data.rem = rem
    }
  }

  /**
   * Handle orientationChange event
   */
  orientationChange() {
    let noChangeCount = 0

    const end = function () {
      clearInterval(interval)
      clearTimeout(timeout)
      interval = null
      timeout = null
    }
    let interval = setInterval(() => {
      const currHeight = window.innerHeight
      const currWidth = window.innerWidth
      if (currWidth === this.data.width && currHeight === this.data.height) {
        noChangeCount++
        if (noChangeCount === this.globals.orientationTestCount) end()
      } else {
        this.data.width = currWidth
        this.data.height = currHeight
        this.resize()
        noChangeCount = 0
      }
    }, this.globals.throttle)
    let timeout = setTimeout(function () {
      end()
    }, this.globals.orientationChangeTimeout)
  }
}
