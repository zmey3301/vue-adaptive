/*******************************************************************************
 * Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>
 * Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea
 * Program is distributed under the terms of the GNU Affero General Public License
 *
 * @date         17.3.2018
 * @license     AGPL-3.0
 ******************************************************************************/
import Vue from "vue"
import _ from 'lodash'

export default class {
	/**
	 * Splitting configuration and creating eventListeners
	 * @param config
	 * @returns {Record<string, any>}
	 */
	constructor (config) {
		// Defaults
		const defaultGlobal = {
			throttle: 17
		}
		const defaultConfig = {
			if: false,
			element: window,
			rem: false,
			from: false,
			to: false,
			base: false,
			k: 1
		}
		// Global config
		this.globals = _.defaults(config.global, defaultGlobal)
		delete config.global
		let deviceList = {}
		for (let device in config) {
			if (config.hasOwnProperty(device)) {
				_.defaults(config[device], defaultConfig)
				device = device.split(':')[0]
				if (!deviceList.hasOwnProperty(device)) deviceList[device] = false
			}
		}
		this.config = config
		let data = {
			is: deviceList,
			width: 0,
			height: 0,
			rem: 0
		}
		this.VM = new Vue({ data })

		// Listening to change events
		window.addEventListener('resize', _.throttle(_.bind(this.resize, this, false), this.globals.throttle))
		window.addEventListener('orientationchange', _.bind(this.orientationChange, this))
		// Initializing Adaptive
		this.resize(true)

		return this.VM.$data
	}

	/**
	 * Handle resize of viewport
	 * @param init
	 */
	resize (init = false) {
		const html = document.getElementsByTagName('html')[0]
		let cache = {
			window: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		}
		let newDeviceList = {}
		// Setting viewport size
		if (this.VM.$data.width !== cache.window.width) this.VM.$data.width = cache.window.width
		if (this.VM.$data.height !== cache.window.height) this.VM.$data.height = cache.window.height
		_.forEach(this.config, (device, name) => {
			// Getting device name
			name = name.split(':')[0]
			// Caching elements viewport
			let data
			if (_.isString(device.element) && !cache.hasOwnProperty(device.element)) {
				let el = document.querySelector(device.element)
				data = cache[device.element] = {
					width: el.innerWidth,
					height: el.innerHeight
				}
			} else if (_.isString(device.element)) data = cache[device.element]
			else if (!_.isString(device.element)) data = cache['window']
			// Detecting is breakpoints valid
			// Testing if function
			let checked = !(device.if && _.isFunction(device.if) && !device.if(data) ||
				// Testing min viewport
				device.from && (device.from.width > data.width || device.from.height > data.height) ||
				// Testing max viewport
				device.to && (device.to.width <= data.width || device.to.height <= data.height))
			// Testing classes
			if (!newDeviceList.hasOwnProperty(name) || !newDeviceList[name]) newDeviceList[name] = checked
			// Scale changing
			if (checked) {
				let rem
				// Setting static rem
				if (device.rem) {
					rem = device.rem
				// Setting dynamic rem
				} else if (device.base) {
					let remBases = []
					if (device.base.width) {
						remBases.push(data.width / device.base.width)
					}
					if (device.base.height) {
						remBases.push(data.height / device.base.height)
					}
					let remBase = _.min(remBases)
					let k = device.k || 1
					rem = remBase * k * 10
				}
				if (rem !== this.VM.$data.rem) {
					html.style.fontSize = `${rem}px`
					this.VM.$data.rem = rem
				}
			}
		})
		// Setting device
		_.forEach(newDeviceList, (checked, name) => {
			let oldClass = this.VM.$data.is[name] ? name : `no-${name}`
			let newClass = checked ? name : `no-${name}`
			// Updating classes if changed
			if (oldClass !== newClass || init) {
				if (!init) html.classList.remove(oldClass)
				html.classList.add(newClass)
				this.VM.$data.is[name] = checked
			}
		})
	}

	/**
	 * Handle orientationChange event
	 */
	orientationChange () {
		const COUNT_TO_END		= 50
		const NO_END_TIMEOUT 	= 1000
		let noChangeCount		= 0

		let end = function () {
			clearInterval(interval)
			clearTimeout(timeout)
			interval = null
			timeout = null
		}
		let interval = setInterval(() => {
			let currHeight = window.innerHeight
			let currWidth = window.innerWidth
			if (currWidth === this.VM.$data.width && currHeight === this.VM.$data.height) {
				noChangeCount++
				if (noChangeCount === COUNT_TO_END) {
					end()
				}
			} else {
				this.VM.$data.width = currWidth
				this.VM.$data.height = currHeight
				this.resize()
				noChangeCount = 0
			}
		})
		let timeout = setTimeout(function () {
			end()
		}, NO_END_TIMEOUT)
	}
}
