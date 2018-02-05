
const webpack = require("webpack")
const path = require("path")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let config = {
		entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
		output: {
			path: path.resolve(__dirname, "./src/main/javascript/public"),
		    filename: "./bundle.js",
		    libraryTarget: 'var',
		    library: 'NetMonitor'
		},
		module: {
			rules: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			}]
		  },
	}

config.plugins = [
	new UglifyJsPlugin()
	];

module.exports = config
