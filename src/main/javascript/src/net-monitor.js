
"use strict";

// "import" keyword is not supported by web browsers => not interpreted in development environment (i.e. without using Babel)
// This is why we must include the following lines at the top of development environment .html files:
// <script src="jquery/dist/jquery.min.js"></script>
// <script src="moment/moment.js"></script>
// <script src="webstomp-client/dist/webstomp.min.js"></script>
// <script src="chart.js/dist/Chart.bundle.min.js"></script>
import $ from "jquery/dist/jquery.min.js";
try {
	module.exports = {
			loaded: function () {
				loaded();
			}
	};
} catch (error) {
	console.log(error);
}

//checking updates are taken into account
$(function () { console.log('v#17'); });

var stompClient;
var chart;

function newDateString(sec) {
	return moment().subtract(sec, 's').format();
}

function connectStomp() {
	stompClient = webstomp.client("ws://localhost:8080/net-monitor/dispatch/socket");
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({}, function () {
		// 1st subscription
		var subscription = stompClient.subscribe("/data/queue", function (message) {
			if (message.body) {
				var t = new Object();
				var now = new moment();
				t.x = now.format();
				t.y = JSON.parse(message.body).value;
				t.moment = now;
				chart.data.datasets[0].data.push(t);
				chart.update();
			} else console.error("error: got empty message");
		});
	}, function (error) {
		console.error("error: " + error);
		stompClient.disconnect(function () {
			console.log("disconnected");
		});
		setTimeout(function () {
			connectStomp();
		}, 3000);
	});
}

function loaded() {
	var ctx = document.getElementById("myChart").getContext('2d');
	chart = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [{
				label: "débit Internet descendant (kbit/s)",

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
						min: newDateString(60),
						max: newDateString(0)
					},
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'dernière minute glissante'
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

	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "http://localhost:8080/net-monitor/dispatch/request", true);
	xhttp.onload = function () {
		chart.options.scales.xAxes[0].time.min = newDateString(60);
		chart.options.scales.xAxes[0].time.max = newDateString(0);
		chart.data.datasets[0].data.splice(0, chart.data.datasets[0].data.length);

		var response = JSON.parse(xhttp.responseText);
		var now = new moment();
		for (let i of response) {
			var t = new Object();
			var m = moment(now).subtract(i.secondsFromNow, 's');
			t.x = m.format();
			t.y = i.value;
			t.moment = m;
			chart.data.datasets[0].data.push(t);
		}
		
		chart.update();
	};
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send();

	window.setInterval(function () {
		var retry = true;
		do {
			var limit = new moment().subtract(60, 's');
			if (chart.data.datasets[0].data.length > 1 && chart.data.datasets[0].data[1].moment.isBefore(limit)) chart.data.datasets[0].data.splice(0, 1);else retry = false;
		} while (retry);

		chart.options.scales.xAxes[0].time.min = newDateString(60);
		chart.options.scales.xAxes[0].time.max = newDateString(0);
		chart.update();
	}, 1000);

	connectStomp();
}
