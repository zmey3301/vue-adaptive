// Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>
// Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea
// Program is distributed under the terms of the GNU Affero General Public License
import Vue from "vue"
import _ from 'lodash'

export default class {
	constructor (config, deviceList) {
		let data = {
			is: deviceList,
			width: 0,
			height: 0,
			rem: 0
		}
		this.VM = new Vue({ data })
		this.config = config

		// Listening to change events
		window.addEventListener('resize', _.bind(this.resize, this))
		window.addEventListener('orientationchange', _.bind(this.orientationChange, this))
		// Initializing Adaptive
		this.resize(true)

		return this.VM.$data
	}

	resize (init = false) {
		const html = document.getElementsByTagName('html')[0]
		let cache = {
			window: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		}
		// Setting viewport size
		if (this.VM.$data.width !== cache.window.width) this.VM.$data.width = cache.window.width
		if (this.VM.$data.height !== cache.window.height) this.VM.$data.height = cache.window.height
		_.forEach(this.config, (device, name) => {
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
			if (device.setDevice) {
				let oldClass = this.VM.$data.is[name] ? name : `no-${name}`
				let newClass = checked ? name : `no-${name}`
				// Updating classes if changed
				if (oldClass !== newClass || init) {
					html.classList.remove(oldClass)
					html.classList.add(newClass)
					this.VM.$data.is[name] = checked
				}
			}
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
				html.style.fontSize = `${rem}px`
				this.VM.$data.rem = rem
			}
		})
	}

	// Handle orientationChange
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
