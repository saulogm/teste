self.addEventListener('install', function(event) {
	event.waitUntil(skipWaiting());
});

self.addEventListener('activate', function(event) {
	event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {	
	var data = event.data.json();

	var title = data.title;
	var options = data.options;

	event.waitUntil(
		self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
	var url = "";
	const clickedNotification = event.notification;
	clickedNotification.close();

	if (!event.action) {
		if (typeof event.notification.data["url"] == "string") {
			url	= event.notification.data["url"]
		}
	} else {
		if (typeof event.notification.data["actions"] == "object") {
			var action = event.notification.data.actions.find(element => element["action"]=== event.action);
			if (typeof action == "object" && typeof action["url"] == "string"){
				url	= action["url"]
			}
		}
	}
	if (typeof url == "string") {
		event.waitUntil(
			clients.matchAll({
				type: "window"
				}).then(function(clientList) {
				for (var i = 0; i < clientList.length; i++) {
					var client = clientList[i];
					if ('focus' in client) {
						client.navigate(url).then(function (windowClient) {
							windowClient.focus();
							if (!event.reply) {
								windowClient.postMessage({
									message: event.reply,
									time: new Date().toString(),
								});
							} 
						});
						return client.focus();
					}
				}
				clients.openWindow(url).then(function (windowClient) {
					windowClient.focus();
					if (!event.reply) {
						windowClient.postMessage({
							message: event.reply,
							time: new Date().toString(),
						});
					} 
				})
			}
		))
	}
});