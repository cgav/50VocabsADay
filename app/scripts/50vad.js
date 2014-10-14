(function (angular) {
	'use strict';

	var app = angular.module('50vad-app', []);

	// ------------------------------------------
	// Controllers
	// ------------------------------------------
	app.controller('VocabularyController', [
		'$scope',
		'MessageService',
		function ($scope, MessageService) {
			$scope.vocable = {};
			$scope.redirectUrl = '';

			$scope.init = function () {
				MessageService.registerReceiver($scope.onMessage);
			};

			$scope.onMessage = function (message) {
				if (message.type === 'REDIRECT-URL') {
					$scope.redirectUrl = message.redirectUrl;
				}
			};

			$scope.shutup = function (duration) {
				MessageService.sendMessage({
					type: 'SHUT-UP',
					duration: duration
				});

				// redirect
				window.history.back();
				// document.location.href = $scope.redirectUrl;
			};

			// start
			$scope.init();
		}
	]);

	// ------------------------------------------
	// Service
	// ------------------------------------------
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

	// ------------------------------------------
	// Directives
	// ------------------------------------------
})(window.angular);