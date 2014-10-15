(function (angular) {
	'use strict';

	var app = angular.module('50vad-options-app', ['MessageServiceModule']);

	// ------------------------------------------
	// Controllers
	// ------------------------------------------
	app.controller('OptionsController', [
		'$scope',
		'MessageService',
		function ($scope, MessageService) {
			$scope.vocables = {};

			$scope.init = function () {
				MessageService.sendMessage({
					type: 'GET-ALL-VOCABLES'
				}, function (vocables) {
					$scope.vocables = vocables;
					$scope.$apply();
				});
			};

			$scope.convertToReadable = function (timestamp) {
				var millisleft = timestamp - Date.now();

				if (millisleft < 0) {
					return 'now';
				}

				if (millisleft <= 600 * 1000) {
					return 'in ' + parseInt(millisleft / 1000) + ' seconds';
				}

				if (millisleft <= 3600 * 1000) {
					return 'in the next hour';
				}

				if (millisleft <= 3600 * 1000 * 6) {
					return 'in the next couple of hours';
				}

				if (millisleft <= 84600 * 1000) {
					return 'today';
				}

				if (millisleft <= 84600 * 1000 * 2) {
					return 'tomorrow';
				}

				return 'in the next couple of days';
			};

			$scope.deleteVocable = function (timestamp) {
				MessageService.sendMessage({
					type: 'DELETE-VOCABLE',
					timestamp: timestamp
				});

				delete $scope.vocables[timestamp];
			};

			// start
			$scope.init();
		}
	]);
})(window.angular);