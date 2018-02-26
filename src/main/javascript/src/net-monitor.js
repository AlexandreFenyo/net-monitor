
"use strict";

const version = "67";

////////////////////////////////////////////////////////////////
// DEVELOPMENT ENVIRONMENT INIT - without Babel

// "import" keyword is not supported by web browsers => not interpreted in development environment (i.e. without using Babel)
// This is why we must include the following lines at the top of development environment .html files:
// <script src="jquery/dist/jquery.min.js"></script>
// <script src="moment/moment.js"></script>
// <script src="webstomp-client/dist/webstomp.min.js"></script>
// <script src="chart.js/dist/Chart.bundle.min.js"></script>

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

// END DEVELOPMENT ENVIRONMENT INIT
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// PRODUCTION ENVIRONMENT INIT - with Babel

import $ from "jquery/dist/jquery.min.js";
import moment from "moment/moment.js";
import webstomp from "webstomp-client/dist/webstomp.min.js";
import Chart from "chart.js/dist/Chart.bundle.min.js";

try {
	module.exports = {
			manage: function (charts, callbackDone) {
				return _manage(charts, callbackDone);
			},
			unmanage: function (manager, callbackDone) {
				_unmanage(manager, callbackDone);
			},
			pushValue: function (manager, dataSet, value, lifeTime, callbackDone) {
				pushValue(manager, dataSet, value, lifeTime, callbackDone);
			},
			getChart: function (manager, dataSet) {
				_manage(manager, dataSet);
			}
	};
	debug = false;
} catch (error) {
	// running in dev env => module.exports is constant
	console.log(error);
}

//END PRODUCTION ENVIRONMENT INIT
////////////////////////////////////////////////////////////////

//checking updates are taken into account
if (debug) $(function () { console.error("================> js#" + version); });

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
							beginAtZero: true
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
