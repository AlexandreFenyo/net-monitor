const webpack = require("webpack");
const path = require("path");

let config = {
		entry: "./src/main/javascript/src/net-monitor.js",
		output: {
			path: path.resolve(__dirname, "./src/main/javascript/public"),
		    filename: "./bundle.js",
		    libraryTarget: 'var',
		    library: 'NetMonitor'
		}
	}

module.exports = config;
