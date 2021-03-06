
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
const version = "122";

var debug = true;

var time_drift = 0;

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
	return _getChart(manager, dataSet);
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

function dumpDataSet(manager, dataSet) {
	console.error("--------------------------------------- DUMPING " + dataSet);
	for (var i = 0; i < manager.chart[dataSet].data.datasets[0].data.length; i++) {
		console.error("data[" + i + "].index = " + manager.chart[dataSet].data.datasets[0].data[i].index);
	}
	console.error("------------------------------------------------");
}

function pastDate(sec) {
	return moment().subtract(sec, 's');
}

// connect the web socket to the server
function connectStomp(manager) {
	let stompClient = webstomp.client(
			(typeof manager.dispatchUrlWebSocket === "undefined") ?
			(((typeof manager.dispatchUrl === "undefined") ?
					((window.location.protocol === "http:" ? "ws:" : "wss:") + "//" + window.location.host + "/net-monitor/dispatch")
					: manager.dispatchUrl.replace(/^http/i, "ws")) + "/socket")
					: manager.dispatchUrlWebSocket
	);
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({}, function () {
		for (let dataSet in manager.chart) {
			var subscription = stompClient.subscribe("/data/" + dataSet, function (message) {
				if (message.body) {
					var t = new Object();
					var now = new moment();
					t.x = moment(JSON.parse(message.body).instant);
					t.y = JSON.parse(message.body).value;
					t.index = JSON.parse(message.body).index;
					t.moment = t.x;

					time_drift = now.diff(t.moment);

					// request lost data
					var len = manager.chart[dataSet].data.datasets[0].data.length;
					if (len > 0) {
						if (manager.chart[dataSet].data.datasets[0].data[len - 1].index + 1 < t.index) {
							let first_index = manager.chart[dataSet].data.datasets[0].data[len - 1].index + 1;
							let last_index = t.index - 1;
							if (debug) console.info("lost indexes: " + first_index + " => " + last_index);

							let xhttp = new XMLHttpRequest();
							xhttp.open("GET", ((typeof manager.dispatchUrl === "undefined") ?
											(window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch")
											: manager.dispatchUrl) + "/requestRange" + "?dataset=" + dataSet + "&first=" + first_index + "&last=" + last_index);
							xhttp.onload = function () {
								let pos = 0;
								var response = JSON.parse(this.responseText);
								for (let i of response) {
									let t = new Object();
									let m = moment(i.instant);
									t.index = i.index;
									t.x = m;
									t.y = i.value;
									t.moment = m;
									if (manager.chart[dataSet].data.datasets[0].data.length === 0) {
										chart.data.datasets[0].data.push(t);
										continue;
									}
									while (manager.chart[dataSet].data.datasets[0].data[pos].index < t.index && pos < manager.chart[dataSet].data.datasets[0].data.length - 1) pos++;

									if (manager.chart[dataSet].data.datasets[0].data[pos].index === t.index) continue;

									if (manager.chart[dataSet].data.datasets[0].data[pos].index > t.index) {
										manager.chart[dataSet].data.datasets[0].data.splice(pos, 0, t);
										pos++;
										continue;
									}

									chart.data.datasets[0].data.push(t);
									pos++;
								}
								manager.chart[dataSet].update();
							};

							xhttp.setRequestHeader("Content-type", "application/json");
							xhttp.send();
						}
					}
					
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
	manager.dispatchUrlWebSocket = charts.dispatchUrlWebSocket;

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
							min: pastDate(c.lifeTime),
							max: pastDate(0)
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
		xhttp.open("GET", ((typeof manager.dispatchUrl === "undefined") ?
						(window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch")
						: manager.dispatchUrl) + "/request" + "?dataset=" + c.dataSet + "&lifetime=" + c.lifeTime);
		xhttp.onload = function () {
			chart.data.datasets[0].data.splice(0, chart.data.datasets[0].data.length);

			try {
				var response = JSON.parse(this.responseText);
				var now = new moment();
				for (let i of response) {
					var t = new Object();
					// var m = moment(now).subtract(i.millisecondsFromNow, 'ms');
					var m = moment(i.instant);
					t.index = i.index;
					t.x = m;
					t.y = i.value;
					t.moment = m;
					chart.data.datasets[0].data.push(t);
				}
			} catch (error) {
				console.log(error);
			}

			if (chart.data.datasets[0].data.length > 0)
				time_drift = now.diff(chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1].moment);

			chart.options.scales.xAxes[0].time.min = pastDate(c.lifeTime).subtract(time_drift, "ms");
			chart.options.scales.xAxes[0].time.max = pastDate(0).subtract(time_drift, "ms");

			chart.update();
			if (typeof callbackDone !== "undefined") callbackDone();
		};

		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send();
	}

	manager.intervalId = window.setInterval(function () {
		for (let dataSet in manager.chart) {
			var retry = true;
			do {
				// 1000 means we suppose the time_drift can change up to 1000 ms during a session, so we keep data 1000 ms longer than we should 
				var limit = new moment().subtract(manager.lifeTime[dataSet], 's').subtract(time_drift + 1000, "ms");
				if (manager.chart[dataSet].data.datasets[0].data.length > 1 && manager.chart[dataSet].data.datasets[0].data[1].moment.isBefore(limit))
					manager.chart[dataSet].data.datasets[0].data.splice(0, 1);
				else retry = false;
			} while (retry);
			manager.chart[dataSet].options.scales.xAxes[0].time.min = pastDate(manager.lifeTime[dataSet]).subtract(time_drift, "ms");;
			manager.chart[dataSet].options.scales.xAxes[0].time.max = pastDate(0).subtract(time_drift, "ms");
			manager.chart[dataSet].update();
		}
	}, 1000);

	manager.stompClient = connectStomp(manager);
	return manager;
}
