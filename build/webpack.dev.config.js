const mainConfig = require('./webpack.config')
const defaults = require('lodash.defaults')

const devConfig = {
	output: {
		filename: 'dev.js'
	},
}

module.exports = defaults(devConfig, mainConfig)
