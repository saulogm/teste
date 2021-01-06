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

	if (typeof options.data["metodo"]=="string" && options.data.metodo=="delete"){
		self.registration.getNotifications({ "tag" : options.tag, "title": title }).then(function(notifications) {
			notifications.forEach(function(notification) {
				notification.close();
			});
		});
	} else {
		event.waitUntil(
			self.registration.showNotification(title, options)
		);
	}
});

self.addEventListener('notificationclose', function(event) {
	//Se já respondeu
});

self.addEventListener('notificationclick', function(event) {
	var url = "";
	const clickedNotification = event.notification;
	clickedNotification.close();

	if (!event.action) {
		if (typeof event.notification.data["url"] == "string") {
			url	= event.notification.data["url"];
		}
	} else {
		if (typeof event.notification.data["actions"] == "object") {
			var action = event.notification.data.actions.find(element => element["action"]=== event.action);
			if (typeof action == "object" && typeof action["url"] == "string"){
				url	= action["url"];
				return fetch(url, {
					method: 'POST',
					headers: new Headers({
					'Content-Type': 'application/json'
					}),
					body: '{"action":"'+event.action+'","msg":"'+event.reply+'"}'
				})
				.then(function(response) {
					if (!response.ok) {
						throw new Error('Bad status code from server.');
					}
					return response.json();
				}).catch(function(error) {
					console.log('problem with your fetch operation: ' + error.message);
				  })
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
						client.navigate(url);
						return client.focus();
					}
				}
				return clients.openWindow(url);
			}
		))
	}
});