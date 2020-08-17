/**************************************************************************************************
 * Copyright © 2017-2019 Mikhail Perelygin <zmey3301@gmail.com>. All rights reserved.             *
 * Huge thanks to:                                                                                *
 *     Sergey Koshevarov <gondragos@gmail.com> for plugin idea;                                   *
 *     Maxim Logvinov <skovorodker.rekdo@gmail.com> for optimisation ideas;                       *
 * Program is distributed under the terms of the GNU Affero General Public License.               *
 *                                                                                                *
 * @date        4.10.2019                                                                         *
 * @license     AGPL-3.0-or-later                                                                 *
 **************************************************************************************************/
import defaults from "lodash.defaults"
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
	 * @property {boolean} [setDevice] - class, no-class and device set toggle
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
	 * @param Vue
	 * @param {{string: device}} config: adaptive configuration file
	 * @param {globalConf} config.global - Plugin's instance-level config
	 */
	static install (Vue, config) {
		const adaptive = new this(Vue, config)
		Vue.adaptive = adaptive
		Object.defineProperty(Vue.prototype, "$adaptive", {
			get: () => adaptive
		})
	}
	/**
	 * Splitting configuration and creating eventListeners
	 * @param Vue
	 * @param {{string: device}} config - adaptive configuration file
	 * @param {globalConf} config.global - Plugin's instance-level config
	 * @returns {Record<string, *>}: reactive model, based on Vue
	 */
	constructor (Vue, config) {
		// Defaults
		const defaultGlobal = {
			throttle: 17,
			orientationTestCount: 50,
			orientationChangeTimeout: 1000
		}
		const defaultConfig = {
			if: null,
			element: window,
			rem: null,
			from: null,
			to: null,
			base: null,
			k: 1
		}
		// Global config
		this.globals = defaults(config.global, defaultGlobal)
		delete config.global
		const deviceList = {}
		for (let device in config) {
			if (config.hasOwnProperty(device)) {
				defaults(config[device], defaultConfig)
				device = device.split(":")[0]
				if (!deviceList.hasOwnProperty(device)) deviceList[device] = false
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
		 * @type {{is: {string: boolean}, width: number, height: number, rem: number}}
		 */
		this.data = vueVersionArray[0] === 2 && vueVersionArray[1] >= 6
			? Vue.observable(data)
			: (new Vue({ data })).$data

		// Listening to change events
		window.addEventListener("resize", throttle(this.resize.bind(this), this.globals.throttle))
		window.addEventListener("orientationchange", this.orientationChange.bind(this))
		// Initializing Adaptive
		this.resize()

		return this.data
	}

	/**
	 * Handle resize of viewport
	 */
	resize () {
		const html = document.documentElement
		const viewport = {
			width: html.offsetWidth,
			height: html.offsetHeight
		}
		const cache = {
			keys: [ window ],
			values: [ viewport ]
		}
		const newDeviceList = {}
		let rem = 10
		// Setting viewport size
		if (this.data.width !== viewport.width)
			this.data.width = viewport.width
		if (this.data.height !== viewport.height)
			this.data.height = viewport.height

		for (let name in this.config) {
			if (this.config.hasOwnProperty(name)) {
				const device = this.config[name]
				// Getting device name
				name = name.split(":")[0]
				// Caching elements viewport
				const elementCacheIndex = cache.keys.indexOf(device.element)
				let data
				if (elementCacheIndex + 1) {
					const el = device.element instanceof HTMLElement
						? device.element
						: document.querySelector(device.element)
					data = {
						width: el.innerWidth,
						height: el.innerHeight
					}
					cache.keys.push(device.element)
					cache.values.push(data)
				} else data = cache.values[elementCacheIndex]
				// Detecting is breakpoints valid
				// Testing if function
				const checked = !(typeof device.if === "function" && !device.if(data) ||
					// Testing min viewport
					device.from && (device.from.width > data.width || device.from.height > data.height) ||
					// Testing max viewport
					device.to && (device.to.width <= data.width || device.to.height <= data.height))
				// Testing classes
				if (!newDeviceList.hasOwnProperty(name) || !newDeviceList[name]) newDeviceList[name] = checked
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
		// Setting device
		for (const name in newDeviceList) {
			if (newDeviceList.hasOwnProperty(name)) {
				let checked = newDeviceList[name]
				let oldClass = this.data.is[name] ? name : `no-${name}`
				let newClass = checked ? name : `no-${name}`
				// Updating classes if changed
				if (oldClass !== newClass || !html.classList.contains(newClass)) {
					if (html.classList.contains(oldClass)) html.classList.remove(oldClass)
					html.classList.add(newClass)
					this.data.is[name] = checked
				}
			}
		}
		if (rem !== this.data.rem) {
			html.style.fontSize = `${rem}px`
			this.data.rem = rem
		}
	}

	/**
	 * Handle orientationChange event
	 */
	orientationChange () {
		let noChangeCount = 0

		const end = function () {
			clearInterval(interval)
			clearTimeout(timeout)
			interval = null
			timeout = null
		}
		const html = document.documentElement
		let interval = setInterval(() => {
			const currHeight = html.offsetHeight
			const currWidth = html.offsetWidth
			if (currWidth === this.data.width && currHeight === this.data.height) {
				noChangeCount++
				if (noChangeCount === this.globals.orientationTestCount) {
					end()
				}
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
