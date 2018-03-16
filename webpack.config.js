
// Copyright 2018 Alexandre Fenyo - alex@fenyo.net - http://fenyo.net
//  
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const webpack = require("webpack")
const path = require("path")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let config_bundle_dev = {
	mode: "development",
	entry: { app: "./src/main/javascript/src/net-monitor.js" },
	output: {
		path: path.resolve(__dirname, "./src/main/javascript/public"),
	    filename: "./net-monitor.bundle.dev.js",
	    libraryTarget: 'var',
	    library: 'NetMonitor'
	},
	module: {
		rules: []
	},
	plugins: [],
	resolve: {
		alias: {
			config: './bundle-config.js'
		}
	}
}

let config_bundle_prod = {
	mode: "production",
	entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
	output: {
		path: path.resolve(__dirname, "./src/main/javascript/public"),
	    filename: "./net-monitor.bundle.min.js",
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
	],
	resolve: {
		alias: {
			config: './bundle-config.js'
		}
	}
}

let config_standalone_dev = {
	mode: "development",
	entry: { app: "./src/main/javascript/src/net-monitor.js" },
	output: {
		path: path.resolve(__dirname, "./src/main/javascript/public"),
	    filename: "./net-monitor.standalone.dev.js",
	    libraryTarget: 'var',
	    library: 'NetMonitor'
	},
	module: {
		rules: []
	},
	plugins: [],
	resolve: {
		alias: {
			config: './standalone-config.js'
		}
	}
}

let config_standalone_prod = {
	mode: "production",
	entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
	output: {
		path: path.resolve(__dirname, "./src/main/javascript/public"),
		filename: "./net-monitor.standalone.min.js",
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
	],
	resolve: {
		alias: {
			config: './standalone-config.js'
		}
	}
}

module.exports = [ config_standalone_prod, config_standalone_dev, config_bundle_dev, config_bundle_prod ];
