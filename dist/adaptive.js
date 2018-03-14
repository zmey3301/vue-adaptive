'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright © 2017-2018 Mikhail Perelygin <zmey3301@gmail.com>
// Huge thanks to Koshevarov Sergey <gondragos@gmail.com> for plugin idea
// Program is distributed under the terms of the GNU Affero General Public License


var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
	function _class(config, deviceList) {
		_classCallCheck(this, _class);

		var data = {
			is: deviceList,
			width: 0,
			height: 0,
			rem: 0
		};
		this.VM = new _vue2.default({ data: data });
		this.config = config;

		// Listening to change events
		window.addEventListener('resize', _lodash2.default.bind(this.resize, this));
		window.addEventListener('orientationchange', _lodash2.default.bind(this.orientationChange, this));
		// Initializing Adaptive
		this.resize(true);

		return this.VM.$data;
	}

	_createClass(_class, [{
		key: 'resize',
		value: function resize() {
			var _this = this;

			var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			var html = document.getElementsByTagName('html')[0];
			var cache = {
				window: {
					width: window.innerWidth,
					height: window.innerHeight
				}
				// Setting viewport size
			};if (this.VM.$data.width !== cache.window.width) this.VM.$data.width = cache.window.width;
			if (this.VM.$data.height !== cache.window.height) this.VM.$data.height = cache.window.height;
			_lodash2.default.forEach(this.config, function (device, name) {
				// Caching elements viewport
				var data = void 0;
				if (_lodash2.default.isString(device.element) && !cache.hasOwnProperty(device.element)) {
					var el = document.querySelector(device.element);
					data = cache[device.element] = {
						width: el.innerWidth,
						height: el.innerHeight
					};
				} else if (_lodash2.default.isString(device.element)) data = cache[device.element];else if (!_lodash2.default.isString(device.element)) data = cache['window'];
				// Detecting is breakpoints valid
				// Testing if function
				var checked = !(device.if && _lodash2.default.isFunction(device.if) && !device.if(data) ||
				// Testing min viewport
				device.from && (device.from.width > data.width || device.from.height > data.height) ||
				// Testing max viewport
				device.to && (device.to.width <= data.width || device.to.height <= data.height));
				// Testing classes
				if (device.setDevice) {
					var oldClass = _this.VM.$data.is[name] ? name : 'no-' + name;
					var newClass = checked ? name : 'no-' + name;
					// Updating classes if changed
					if (!oldClass === newClass || init) {
						html.classList.remove(oldClass);
						html.classList.add(newClass);
						_this.VM.$data.is[name] = checked;
					}
				}
				// Scale changing
				if (checked) {
					var rem = void 0;
					// Setting static rem
					if (device.rem) {
						rem = device.rem;
						// Setting dynamic rem
					} else if (device.base) {
						var remBases = [];
						if (device.base.width) {
							remBases.push(data.width / device.base.width);
						}
						if (device.base.height) {
							remBases.push(data.height / device.base.height);
						}
						var remBase = _lodash2.default.min(remBases);
						var k = device.k || 1;
						rem = remBase * k * 10;
					}
					html.style.fontSize = rem;
					_this.VM.$data.rem = rem;
				}
			});
		}

		// Handle orientationChange

	}, {
		key: 'orientationChange',
		value: function orientationChange() {
			var _this2 = this;

			var COUNT_TO_END = 50;
			var NO_END_TIMEOUT = 1000;
			var noChangeCount = 0;

			var end = function end() {
				clearInterval(interval);
				clearTimeout(timeout);
				interval = null;
				timeout = null;
			};
			var interval = setInterval(function () {
				var currHeight = window.innerHeight;
				var currWidth = window.innerWidth;
				if (currWidth === _this2.VM.$data.width && currHeight === _this2.VM.$data.height) {
					noChangeCount++;
					if (noChangeCount === COUNT_TO_END) {
						end();
					}
				} else {
					_this2.VM.$data.width = currWidth;
					_this2.VM.$data.height = currHeight;
					_this2.resize();
					noChangeCount = 0;
				}
			});
			var timeout = setTimeout(function () {
				end();
			}, NO_END_TIMEOUT);
		}
	}]);

	return _class;
}();

exports.default = _class;