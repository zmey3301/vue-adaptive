# vue-adaptive

A rem scale adaptive with breakpoints for Vue.js

[![npm](https://img.shields.io/npm/v/vue-adaptive.svg)](https://www.npmjs.com/package/vue-adaptive)
[![npm](https://img.shields.io/npm/dt/vue-adaptive.svg)](https://www.npmjs.com/package/vue-adaptive)
[![npm bundle size (version)](https://img.shields.io/bundlephobia/min/vue-adaptive/latest)](https://bundlephobia.com/result?p=vue-adaptive@1.4.1)
[![Inline docs](http://inch-ci.org/github/zmey3301/vue-adaptive.svg?branch=master)](http://inch-ci.org/github/zmey3301/vue-adaptive)
[![MIT](https://img.shields.io/npm/l/vue-adaptive.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/zmey3301/vue-adaptive.svg)](https://github.com/zmey3301/vue-adaptive/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/zmey3301/vue-adaptive.svg)](https://github.com/zmey3301/vue-adaptive/commits/master)
[![David](https://img.shields.io/david/zmey3301/vue-adaptive.svg)](https://david-dm.org/zmey3301/vue-adaptive)
[![CodeFactor](https://www.codefactor.io/repository/github/zmey3301/vue-adaptive/badge)](https://www.codefactor.io/repository/github/zmey3301/vue-adaptive)
[![codecov](https://codecov.io/gh/zmey3301/vue-adaptive/branch/master/graph/badge.svg?token=rDPIiIiKyl&style=flat-square)](https://codecov.io/gh/zmey3301/vue-adaptive)

## Setup

Install vue-adaptive from **npm**: `npm i vue-adaptive --save`

Or **yarn**: `yarn add vue-adaptive`

Then import plugin and use in your main.js

```javascript
import Vue from 'vue'
import Adaptive from 'vue-adaptive'

Vue.use(Adaptive, config)
```

## Configuration

Configuration object has two parts:

#### 1. Global configuration

Configuration object has object named 'global' in it. This object contains all global parameters of plugin.

```json
{
  "global": {
    "rem": 10,
    "throttling": 17,
    "orientationTestCount": 25,
    "orientationChangeTimeout": 1000
  }
}
```

`rem`: Default rem value in case no breakpoint matched. Default: 10.

`throttling`: Time in milliseconds, changes the frequency of viewport update.
May be useful if you don't care about changes step and want to reduce CPU usage. Default: 17 (60fps frame time).

`orientationTestCount`: Count of checks with identical results meaning orientationchange event is over. Default: 25.

`orientationChangeTimeout`: Max duration of the orientationchange event. Default: 1000.

#### 2. Devices (breakpoints) configuration

Besides 'global' object configuration object represents a list of breakpoints (or devices)

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
	k: <k>
}
```

`element`: String or HTMLElement, contains element selector that will be used for detecting viewport. Default: window.

`if`: Condition, `functions(viewport)`, viewport contains width and height of element, function affects device type.

`rem`: Static rem value, overrides `k` and `base`.

`from`: Minimal width and height for setting device.

`to`: Maximal width and height for setting device.

`base`: Base width and height for rem calculation.

`k`: Additional k for rem calculation.

`setDevice`: Boolean, if true adaptive will set class or no-class and deviceType based on device name.

You also can create many breakpoints for one device by adding name to device, for example:

```json
{
  "desktop:wide": {
    "rem": 10,
    "from": {
      "width": 1366
    }
  },
  "desktop:thin": {
    "k": 0.75,
    "from": {
      "width": 1008
    },
    "base": {
      "width": 1100
    },
    "to": {
      "width": 1365
    }
  }
}
```

In this case both breakpoints will have `desktop` global class (and `$adaptive.is` of course), but two various rem calculations.

## Usage

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
