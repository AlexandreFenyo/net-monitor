
var stompClient;

function connectStomp() {
	console.log("trying to connect to Stomp server");
	
	stompClient = webstomp.client("ws://w7:8080/net-monitor/dispatch/socket");
	stompClient.heartbeat = { incoming: 1000, outgoing: 1000 };
	stompClient.connect({},
		function() {
	 		var subscription = stompClient.subscribe("/data/queue", function(message) {
				if (message.body) {
					console.log("got message with body " + message.body)
				} else {
					console.log("got empty message");
				}
			});
	 	},
		function(error) {
				console.log("error: " + error);
				stompClient.disconnect(function() { console.log("disconnected"); });
				setTimeout(function() { connectStomp(); }, 3000);
		});
}

connectStomp();
