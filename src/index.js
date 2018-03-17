// Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>
// Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea
// Program is distributed under the terms of the GNU Affero General Public License
import _ from 'lodash'
import Adaptive from './adaptive'

export default {
	install (Vue, config) {
		const defaultConfig = {
			if				: false,
			element			: window,
			rem				: false,
			from			: false,
			to				: false,
			base			: false,
			k				  : 1,
			setDevice	: false
		}
		let deviceList = {}
		for (let device in config) {
			if (config.hasOwnProperty(device)) {
				_.defaults(config[device], defaultConfig)
				device = device.split(':')[0]
				if (!deviceList.hasOwnProperty(device)) deviceList[device] = false
			}
		}
		console.log(deviceList)
		let adaptive = new Adaptive(config, deviceList)
		Vue.mixin({
			beforeCreate () {
				this.$adaptive = adaptive
			}
		})
	}
}

