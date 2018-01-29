
var stompClient;
var chart;

function newDateString(sec) {
	return moment().subtract(sec, 's').format();
}

function connectStomp() {
	stompClient = webstomp.client("ws://localhost:8080/net-monitor/dispatch/socket");
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({},
		function() {
		// 1st subscription
 		var subscription = stompClient.subscribe("/data/queue", function(message) {
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
 	},
	function(error) {
		console.error("error: " + error);
		stompClient.disconnect(function() { console.log("disconnected"); });
		setTimeout(function() { connectStomp(); }, 3000);
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

	window.setInterval(function() {
		var retry = true;
		do {
			const limit = new moment().subtract(60, 's');
			if (chart.data.datasets[0].data.length > 1 && chart.data.datasets[0].data[1].moment.isBefore(limit)) chart.data.datasets[0].data.splice(0, 1);
			else retry = false;
		} while (retry);
		
		chart.options.scales.xAxes[0].time.min = newDateString(60);
		chart.options.scales.xAxes[0].time.max = newDateString(0);
		chart.update();
	}, 1000);

	connectStomp();
}
