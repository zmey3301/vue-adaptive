module.exports = {
	target: 'node',
	entry: './src/index.js',
	output: {
		filename: 'adaptive.bundle.js',
		libraryTarget: 'umd2'
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

