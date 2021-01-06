// Copyright 2015 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

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
	const clickedNotification = event.notification;
	clickedNotification.close();
	if (!event.action) {
		if (typeof event.notification.data["url"] == "string") {
			event.waitUntil(
				clients.openWindow(event.notification.data.url)
			)
		}
	} else {
		var action = event.notification.data.find(element => element["action"]=== event.action);
		if (typeof action == "object" && typeof action["url"] == "string"){
			event.waitUntil(
				clients.openWindow(action["url"])
			)
		}
	}
});