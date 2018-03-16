
// "use strict";

const version = "136";

export const manage = function (charts, callbackDone) {
	return _manage(charts, callbackDone);
};

let moment = require("moment/moment.js");
let Chart = require("chart.js/dist/Chart.bundle.min.js");

console.error("===============================> js#" + version);

var chart2manager = new Object();

function pastDate(sec) {
	return moment().subtract(sec, 's');
}

function _manage(charts, callbackDone) {
	var manager = new Object();
	manager.chart = new Object();
	manager.lifeTime = new Object();
	manager.id = new Object();

	for (let c of charts.views) {
		var ctx = document.getElementById(c.id).getContext("2d");
		let chart = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [{
					data: [],
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
						display: true
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
		
{
	let t = new Object();
	let now = new moment();
	let m = moment(now).subtract(0, 'ms');
	t.index = 5;
	t.x = m;
	t.y = 10;
	t.moment = m;
	chart.data.datasets[0].data.push(t);
}		
{
	let t = new Object();
	let now = new moment();
	let m = moment(now).subtract(5000, 'ms');
	t.index = 5;
	t.x = m;
	t.y = 10;
	t.moment = m;
	chart.data.datasets[0].data.push(t);
}		
chart.update();

	}

	manager.intervalId = window.setInterval(function () {
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

console.error("TIME: " + manager.chart[dataSet].options.scales.xAxes[0].time.min.format());
			
			manager.chart[dataSet].update();
		}
	}, 1000);

	return manager;
}
