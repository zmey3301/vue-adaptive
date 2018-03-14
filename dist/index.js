'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _adaptive = require('./adaptive');

var _adaptive2 = _interopRequireDefault(_adaptive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>
// Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea
// Program is distributed under the terms of the GNU Affero General Public License
exports.default = {
	install: function install(Vue, config) {
		var defaultConfig = {
			if: false,
			element: window,
			rem: false,
			from: false,
			to: false,
			base: false,
			k: 1,
			setDevice: false
		};
		var deviceList = {};
		for (var device in config) {
			if (config.hasOwnProperty(device)) {
				_lodash2.default.defaults(config[device], defaultConfig);
				if (config[device].setDevice) deviceList[device] = false;
			}
		}
		console.log(deviceList);
		var adaptive = new _adaptive2.default(config, deviceList);
		Vue.mixin({
			beforeCreate: function beforeCreate() {
				this.$adaptive = adaptive;
			}
		});
	}
};