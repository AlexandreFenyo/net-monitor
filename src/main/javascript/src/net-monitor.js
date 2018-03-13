
// Copyright 2018 Alexandre Fenyo - alex@fenyo.net - http://fenyo.net
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const config = require('config');
const version = "107";

var debug = true;

export const manage = function (charts, callbackDone) {
	return _manage(charts, callbackDone);
};

export const unmanage = function (manager, callbackDone) {
	_unmanage(manager, callbackDone);
};

export const pushValue = function (manager, dataSet, value, lifeTime, callbackDone) {
	_pushValue(manager, dataSet, value, lifeTime, callbackDone);
};

export const getChart = function (manager, dataSet) {
	_getChart(manager, dataSet);
};

if (config.moduleType === "bundle") {
	var $ = config.$;
	var moment = config.moment;
	var webstomp = config.webstomp;
	var Chart = config.Chart;
} else {
	var $ = window.$;
	var moment = window.moment;
	var webstomp = window.webstomp;
	var Chart = window.Chart;
}

//checking that updates are taken into account
if (debug) $(function () { console.error("===============================> js#" + version); });

var chart2manager = new Object();

// compute a date in the past
function pastDateString(sec) {
	return moment().subtract(sec, 's').format();
}

function pastDate(sec) {
	return moment().subtract(sec, 's');
}

// connect the web socket to the server
function connectStomp(manager) {
	let stompClient = webstomp.client(
			((typeof manager.dispatchUrl === "undefined") ?
					((window.location.protocol === "http:" ? "ws:" : "wss:") + "//" + window.location.host + "/net-monitor/dispatch")
					: manager.dispatchUrl.replace(/^http/i, "ws")) + "/socket"
	);
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({}, function () {
		for (let dataSet in manager.chart) {
			var subscription = stompClient.subscribe("/data/" + dataSet, function (message) {
				if (message.body) {
					var t = new Object();
					var now = new moment();
					t.x = now.format();
					t.y = JSON.parse(message.body).value;
					t.moment = now;
					manager.chart[dataSet].data.datasets[0].data.push(t);
					manager.chart[dataSet].update();
				} else console.error("error: got empty STOMP message");
			});
		}
	}, function (error) {
		console.error("error: " + error);
		stompClient.disconnect(function () {
			if (debug) console.log("websocket disconnected");
		});
		setTimeout(function () {
			manager.stompClient = connectStomp(manager);
		}, 3000);
	});
	return stompClient;
}

function _pushValue(manager, dataSet, value, lifeTime, callbackDone) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET",
			((typeof manager.dispatchUrl === "undefined") ? (window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch") : manager.dispatchUrl)
			+ "/add" + "?dataset=" + dataSet + "&value=" + value +
			((typeof lifeTime !== "undefined") ? ("&lifetime=" + lifeTime) : ""));
	xhttp.onload = function () {
		if (typeof callbackDone !== "undefined") callbackDone();
	};
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send();
}

function _getChart(manager, dataSet) {
	return manager.chart[dataSet];
}

function _unmanage(manager, callbackDone) {
	window.clearInterval(manager.intervalId);
	manager.stompClient.disconnect(function () {
		if (debug) console.log("websocket disconnected");
		if (typeof callbackDone !== "undefined") callbackDone();
	});
	manager.stompClient = undefined;
	for (let dataSet in manager.chart) {
		chart2manager[manager.id[dataSet]] = undefined;
		manager.chart[dataSet].destroy();
		manager.id[dataSet] = undefined;
	}
	manager.chart = undefined;
}

function _manage(charts, callbackDone) {
	var manager = new Object();
	manager.chart = new Object();
	manager.lifeTime = new Object();
	manager.id = new Object();
	manager.dispatchUrl = charts.dispatchUrl;

	for (let c of charts.views)
		if (chart2manager[c.id] !== undefined) {
			console.error("chart with id [" + c.id + "] already managed");
			return;
		}

	for (let c of charts.views) {
		var ctx = document.getElementById(c.id).getContext("2d");
		let chart = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [{
					label: c.topLabel,
					data: [],
					backgroundColor: Color("#7743CE").alpha(0.5).rgbString(),
					borderWidth: 1
				}]
			},
			options: {
		    	// see http://www.chartjs.org/docs/latest/general/responsive.html
		    	responsive: false,
		    	maintainAspectRatio: false,
				scales: {
					xAxes: [{
						type: "time",
						time: {
							unit: "second",
							min: pastDateString(c.lifeTime),
							max: pastDateString(0)
						},
						display: true,
						scaleLabel: {
							display: true,
							labelString: c.bottomLabel
						},
						ticks: {
							major: {
								fontStyle: "bold",
								fontColor: "#777777"
							}
						}
					}],
					yAxes: [{
						ticks: {
							beginAtZero: true,
							callback: function(value, index, values) {
								let v = value;
								if (value >= 1000000) {
									v = v / 1000000;
									return v + " Mbit/s";
								}
								if (value >= 1000) {
									v = v / 1000;
									return v + " Kbit/s";
								}
		                        return value + " bit/s";
		                    }
						}
					}]
				}
			}
		});
		chart2manager[c.id] = manager;
		manager.chart[c.dataSet] = chart;
		manager.lifeTime[c.dataSet] = c.lifeTime;
		manager.id[c.dataSet] = c.id;

		let xhttp = new XMLHttpRequest();
		xhttp.open("GET", ((typeof charts.dispatchUrl === "undefined") ?
						(window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch")
						: charts.dispatchUrl) + "/request" + "?dataset=" + c.dataSet + "&lifetime=" + c.lifeTime);
		xhttp.onload = function () {
			chart.options.scales.xAxes[0].time.min = pastDate(c.lifeTime);
			chart.options.scales.xAxes[0].time.max = pastDate(0);
			chart.data.datasets[0].data.splice(0, chart.data.datasets[0].data.length);

			try {
				var response = JSON.parse(this.responseText);
				var now = new moment();
				for (let i of response) {
					var t = new Object();
					var m = moment(now).subtract(i.millisecondsFromNow, 'ms');
					t.x = m.format();
					t.y = i.value;
					t.moment = m;
					chart.data.datasets[0].data.push(t);
				}
			} catch (error) {
				console.log(error);
			}
			
			chart.update();
			if (typeof callbackDone !== "undefined") callbackDone();
		};

		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send();
	}

	let lastcall = new moment();
	manager.intervalId = window.setInterval(function () {
		if (new moment().diff(lastcall) < 1000) return;
		lastcall = new moment();
		for (let dataSet in manager.chart) {
			var retry = true;
			do {
				var limit = new moment().subtract(manager.lifeTime[dataSet], 's');
				if (manager.chart[dataSet].data.datasets[0].data.length > 1 && manager.chart[dataSet].data.datasets[0].data[1].moment.isBefore(limit))
					manager.chart[dataSet].data.datasets[0].data.splice(0, 1);
				else retry = false;
			} while (retry);
			
			manager.chart[dataSet].options.scales.xAxes[0].time.min = pastDate(manager.lifeTime[dataSet]);
			manager.chart[dataSet].options.scales.xAxes[0].time.max = pastDate(0);
			manager.chart[dataSet].update();
		}
	}, 200);

	manager.stompClient = connectStomp(manager);
	return manager;
}
