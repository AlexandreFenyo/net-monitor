
const webpack = require("webpack")
const path = require("path")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let config_prod = {
		entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
		output: {
			path: path.resolve(__dirname, "./src/main/javascript/public"),
		    filename: "./net-monitor.min.js",
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
		plugins: [
			new UglifyJsPlugin()
			]
	}

let config_dev = {
	entry: [ "./src/main/javascript/src/net-monitor.js" ],
	output: {
		path: path.resolve(__dirname, "./src/main/javascript/public"),
	    filename: "./net-monitor.dev.js",
	    libraryTarget: 'var',
	    library: 'NetMonitor',
	},
	module: {},
	plugins: []
}

 module.exports = [ config_prod, config_dev ];
