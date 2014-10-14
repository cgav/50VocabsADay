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
			$scope.vocable = {};
			$scope.translation = '';
			$scope.displayedChars = 0;

			$scope.isCorrect = false;
			$scope.isIncorrect = false;

			$scope.init = function () {
				MessageService.registerReceiver($scope.onMessage);

				MessageService.sendMessage({
					type: 'GET-NEXT-VOCABLE'
				}, function (nextVocable) {
					$scope.vocable = nextVocable;
					$scope.$apply();
				});
			};

			$scope.checkTranslation = function () {
				if ($scope.translation === $scope.vocable.t) {
					$scope.isCorrect = true;
					$scope.isIncorrect = false;
					$scope.vocable.l++;
				} else {
					$scope.isIncorrect = true;
					$scope.vocable.l = 1;
				}

				MessageService.sendMessage({
					type: 'UPDATE-VOCABLE',
					vocable: $scope.vocable
				}, function () {
					window.setTimeout(function (hasNext) {
						if (hasNext) {
							// load new vocable
							document.location.href = document.location.href;
						} else {
							// redirect to previous page
							window.history.back();
						}
					}, 1500);
				});
			};

			$scope.onMessage = function (message) {
				if (message.type === 'REDIRECT-URL') {
					$scope.redirectUrl = message.redirectUrl;
				}
			};

			$scope.showHint = function () {
				if ($scope.displayedChars < $scope.vocable.t.length) {
					$scope.displayedChars++;
					$scope.translation = $scope.vocable.t.substr(0, $scope.displayedChars);
				}
			};

			$scope.shutup = function (duration) {
				MessageService.sendMessage({
					type: 'SHUT-UP',
					duration: duration
				});

				// redirect
				window.history.back();
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