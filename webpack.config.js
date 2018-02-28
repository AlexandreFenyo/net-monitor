
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

//let config_ie11 = {
//	entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
//	output: {
//		path: path.resolve(__dirname, "./src/main/javascript/public"),
//	    filename: "./net-monitor.dev.ie11.js",
//	    libraryTarget: 'var',
//		library: 'NetMonitor'
//	},
//	module: {
//		rules: [{
//			test: /\.js$/,
//			exclude: /node_modules/,
//			loader: "babel-loader"
//		}]
//	  },
//	plugins: []
//}

//let config_prod = {
//	entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
//	output: {
//		path: path.resolve(__dirname, "./src/main/javascript/public"),
//	    filename: "./net-monitor.min.js",
//	    libraryTarget: 'var',
//	    library: 'NetMonitor'
//	},
//	module: {
//		rules: [{
//			test: /\.js$/,
//			exclude: /node_modules/,
//			loader: "babel-loader"
//		}]
//	  },
//	plugins: [
//		new UglifyJsPlugin()
//		]
//}
//
//let config_dev = {
//entry: [ "./src/main/javascript/src/net-monitor.js" ],
//output: {
//	path: path.resolve(__dirname, "./src/main/javascript/public"),
//    filename: "./net-monitor.dev.js",
//    libraryTarget: 'var',
//    library: 'NetMonitor',
//},
//module: {},
//plugins: []
//}
//
//let config_ie11 = {
//entry: [ "babel-polyfill", "./src/main/javascript/src/net-monitor.js" ],
//output: {
//	path: path.resolve(__dirname, "./src/main/javascript/public"),
//    filename: "./net-monitor.dev.ie11.js",
//    libraryTarget: 'var',
//	library: 'NetMonitor'
//},
//module: {
//	rules: [{
//		test: /\.js$/,
//		exclude: /node_modules/,
//		loader: "babel-loader"
//	}]
//  },
//plugins: []
//}

 module.exports = [ config_prod, config_dev /* , config_ie11 */ ];
