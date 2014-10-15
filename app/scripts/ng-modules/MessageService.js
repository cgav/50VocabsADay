(function (angular) {
	'use strict';

	var app = angular.module('MessageServiceModule', []);
	
	app.service('MessageService', [function () {
		var me = this;

		me.receivers = [];

		me.sendMessage = function (message, responseCallback) {
			chrome.runtime.sendMessage(message, responseCallback);
		};

		me.registerReceiver = function (callback) {
			me.receivers.push(callback);
		};

		// receiving messages
		chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
			me.receivers.forEach(function (receiverCallback) {
				receiverCallback(message, sender, sendResponse);
			});
			return true;
		});
	}]);
})(window.angular);
