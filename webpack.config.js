module.exports = {
	target: 'node',
	entry: './src/index.js',
	output: {
		filename: 'adaptive.bundle.js',
		libraryTarget: 'umd'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
					'eslint-loader'
				]
			}
		],
	}
}

