#vue-adaptive
A rem scale adaptive with breakpoints for Vue.js

[![npm](https://img.shields.io/npm/v/vue-adaptive.svg?style=for-the-badge)](https://www.npmjs.com/package/vue-adaptive)
![npm](https://img.shields.io/npm/dt/vue-adaptive.svg?style=for-the-badge)
![npm](https://img.shields.io/npm/l/vue-adaptive.svg?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/zmey3301/vue-adaptive.svg?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/zmey3301/vue-adaptive.svg?style=for-the-badge)
## Setup

Install vue-adaptive from **npm**: `npm i vue-adaptive --save`

Or **yarn**: `yarn add vue-adaptive`

Then import plugin and use in your main.js

```javascript
import Vue from 'vue'
import Adaptive from 'vue-adaptive'

Vue.use(Adaptive, config)
```
### Configuration
Configuration file represents a list of breakpoints (or devices)

Device structure is:
```
<device>: {// Device (and global class) name
    if: <if>,
	element: <selector>,
	rem: <px>
	from: {
		width: <fromWidth>,
		height: <fromHeight>
	},
	to: {
		width: <toWidth>,
		height: <toHeight>
	},
	base: {
		width: <toWidth>,
		height: <toHeight>
	},
	k: <k>,
	setDevice: <Boolean>
	}
```

`element`: String, contains element selector that will be used for detecting viewport. Default: window.

`if`: Condition, `functions(viewport)`, viewport contains width and height of element, function affects device type.

`rem`: Static rem value, overrides `k` and `base`.

`from`: Minimal width and height for setting device.

`to`: Maximal width and height for setting device.

`base`: Base width and height for rem calculation.

`k`: Additional k for rem calculation.

`setDevice`: Boolean, if true adaptive will set class or no-class and deviceType based on device name.
### Usage
You can use global classes in your styles:
```stylus
.someblock
    background-color: blue
    .mobile &
      background-color: red
```
Or conditions in vue template:
```vue
<div v-show="$adaptive.is.mobile"></div>
```
You always can see current viewport and rem value in `$adaptive` inside of your component.
```vuejs
computed = {
	isWidth1600 () {
		return this.$adaptive.width >= 1600
	}
}
```
`$adaptive` has `height`, `width`, `rem` numeric values and `is` object, containing all device names with boolean value.
