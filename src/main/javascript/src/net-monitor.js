
"use strict";

////////////////////////////////////////////////////////////////
// DEVELOPMENT ENVIRONMENT INIT - without Babel

// "import" keyword is not supported by web browsers => not interpreted in development environment (i.e. without using Babel)
// This is why we must include the following lines at the top of development environment .html files:
// <script src="jquery/dist/jquery.min.js"></script>
// <script src="moment/moment.js"></script>
// <script src="webstomp-client/dist/webstomp.min.js"></script>
// <script src="chart.js/dist/Chart.bundle.min.js"></script>

export const loaded = function (charts) {
	_loaded(charts);
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
			loaded: function (charts) {
				_loaded(charts);
			}
	};
} catch (error) {
	console.log(error);
}

//END PRODUCTION ENVIRONMENT INIT
////////////////////////////////////////////////////////////////

//checking updates are taken into account
$(function () { console.log('js#27'); });

var stompClient;
var chart;

function newDateString(sec) {
	return moment().subtract(sec, 's').format();
}

function connectStomp(charts) {
	stompClient = webstomp.client("ws://localhost:8080/net-monitor/dispatch/socket");
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({}, function () {
		for (let c of charts) {
			var subscription = stompClient.subscribe("/data/" + c.dataSet, function (message) {
				if (message.body) {
					var t = new Object();
					var now = new moment();
					t.x = now.format();
					t.y = JSON.parse(message.body).value;
					t.moment = now;
					c.chart.data.datasets[0].data.push(t);
					c.chart.update();
				} else console.error("error: got empty message");
			});
		}
	}, function (error) {
		console.error("error: " + error);
		stompClient.disconnect(function () {
			console.log("disconnected");
		});
		setTimeout(function () {
			connectStomp(charts);
		}, 3000);
	});
}

function _loaded(charts) {
	for (let c of charts) {

		var ctx = document.getElementById(c.id).getContext("2d");
		chart = new Chart(ctx, {
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
				scales: {
					xAxes: [{
						type: "time",
						time: {
							min: newDateString(c.range),
							max: newDateString(0)
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

		var xhttp = new XMLHttpRequest();
		xhttp.chart = chart;
		xhttp.open("GET", "http://localhost:8080/net-monitor/dispatch/request?dataset=" + c.dataSet + "&range=" + c.range, true);
		console.error("envoi requête: " + "http://localhost:8080/net-monitor/dispatch/request?dataset=" + c.dataSet + "&range=" + c.range);
		xhttp.onload = function () {
			this.chart.options.scales.xAxes[0].time.min = newDateString(c.range);
			this.chart.options.scales.xAxes[0].time.max = newDateString(0);
			this.chart.data.datasets[0].data.splice(0, this.chart.data.datasets[0].data.length);

			try {
				var response = JSON.parse(this.responseText);
				var now = new moment();
				for (let i of response) {
					var t = new Object();
					var m = moment(now).subtract(i.secondsFromNow, 's');
					t.x = m.format();
					t.y = i.value;
					t.moment = m;
					this.chart.data.datasets[0].data.push(t);
				}
			} catch (error) {
				console.log(error);
			}
			
			this.chart.update();
		};

		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send();

		window.setInterval(function () {
			for (let c of charts) {
				var retry = true;
				do {
					var limit = new moment().subtract(c.range, 's');
					if (c.chart.data.datasets[0].data.length > 1 && c.chart.data.datasets[0].data[1].moment.isBefore(limit)) c.chart.data.datasets[0].data.splice(0, 1);else retry = false;
				} while (retry);

				c.chart.options.scales.xAxes[0].time.min = newDateString(c.range);
				c.chart.options.scales.xAxes[0].time.max = newDateString(0);
				c.chart.update();
			}
		}, 1000);
		}

	connectStomp(charts);
}
