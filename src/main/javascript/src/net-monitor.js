
"use strict";

const version = "60";

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
	_manage(charts, callbackDone);
};

export const unmanage = function (charts, callbackDone) {
	_unmanage(charts, callbackDone);
};

export const pushValue = function (charts, dataSet, value, lifeTime, callbackDone) {
	_pushValue(charts, dataSet, value, lifeTime, callbackDone);
};

export const getChart = function (charts, dataSet) {
	_getChart(charts, dataSet);
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
				_manage(charts, callbackDone);
			},
			unmanage: function (charts, callbackDone) {
				_unmanage(charts, callbackDone);
			},
			pushValue: function (charts, dataSet, value, lifeTime, callbackDone) {
				pushValue(charts, dataSet, value, lifeTime, callbackDone);
			},
			getChart: function (charts, dataSet) {
				_manage(charts, dataSet);
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

// compute a date in the past
function pastDateString(sec) {
	return moment().subtract(sec, 's').format();
}

// connect the web socket to the server
function connectStomp(charts) {
	let stompClient = webstomp.client(
			((typeof charts.dispatchUrl === "undefined") ?
					((window.location.protocol === "http:" ? "ws:" : "wss:") + "//" + window.location.host + "/net-monitor/dispatch")
					: charts.dispatchUrl.replace(/^http/i, "ws")) + "/socket"
	);
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({}, function () {
		for (let c of charts.views) {
			var subscription = stompClient.subscribe("/data/" + c.dataSet, function (message) {
				if (message.body) {
					var t = new Object();
					var now = new moment();
					t.x = now.format();
					t.y = JSON.parse(message.body).value;
					t.moment = now;
					c.chart.data.datasets[0].data.push(t);
					c.chart.update();
				} else console.error("error: got empty STOMP message");
			});
		}
	}, function (error) {
		console.error("error: " + error);
		stompClient.disconnect(function () {
			if (debug) console.log("websocket disconnected");
		});
		setTimeout(function () {
			connectStomp(charts);
		}, 3000);
	});
	return stompClient;
}

function _pushValue(charts, dataSet, value, lifeTime, callbackDone) {
console.error("pushValue");
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET",
			((typeof charts.dispatchUrl === "undefined") ? (window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch") : charts.dispatchUrl)
			+ "/add" + "?dataset=" + dataSet + "&value=" + value +
			((typeof lifeTime !== "undefined") ? ("&lifetime=" + lifeTime) : ""));
	xhttp.onload = function () {
		if (typeof callbackDone !== "undefined") callbackDone();
	};
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send();
}

function _getChart(charts, dataSet) {
	for (let c of charts.views) {
		if (c.dataSet == dataSet) return c.chart;
	}
}

function _unmanage(charts, callbackDone) {
	window.clearInterval(charts.intervalId);
	charts.stompClient.disconnect(function () {
		if (debug) console.log("websocket disconnected");
		if (typeof callbackDone !== "undefined") callbackDone();
	});
	for (let c of charts.views) c.chart.destroy();
}

function _manage(charts, callbackDone) {
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
		c.chart = chart;

		let xhttp = new XMLHttpRequest();
		xhttp.open("GET", ((typeof charts.dispatchUrl === "undefined") ?
						(window.location.protocol + "//" + window.location.host + "/net-monitor/dispatch")
						: charts.dispatchUrl) + "/request" + "?dataset=" + c.dataSet + "&lifetime=" + c.lifeTime);
		xhttp.onload = function () {
			chart.options.scales.xAxes[0].time.min = pastDateString(c.lifeTime);
			chart.options.scales.xAxes[0].time.max = pastDateString(0);
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

	charts.intervalId = window.setInterval(function () {
		for (let c of charts.views) {
			var retry = true;
			do {
				var limit = new moment().subtract(c.lifeTime, 's');
				if (c.chart.data.datasets[0].data.length > 1 && c.chart.data.datasets[0].data[1].moment.isBefore(limit)) c.chart.data.datasets[0].data.splice(0, 1);else retry = false;
			} while (retry);
			
			c.chart.options.scales.xAxes[0].time.min = pastDateString(c.lifeTime);
			c.chart.options.scales.xAxes[0].time.max = pastDateString(0);
			c.chart.update();
		}
	}, 1000);

	charts.stompClient = connectStomp(charts);
}
