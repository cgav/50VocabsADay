(function (angular) {
	'use strict';

	var app = angular.module('50vad-popup-app', ['MessageServiceModule', 'ngSanitize']);

	// ------------------------------------------
	// Controllers
	// ------------------------------------------
	app.controller('PopupController', [
		'$scope',
		'MessageService',
		function ($scope, MessageService) {
			$scope.q = '';
			$scope.result = {};
			$scope.entries = [];

			$scope.init = function () {
			};

			$scope.search = function () {
				MessageService.sendMessage({
					type: 'SEARCH-VOCABLE',
					v: $scope.q,
					fromLang: 'en',
					toLang: 'de'
				}, function (result) {
					if (result.error) {
						return window.alert(result.error);
					}

					$scope.result = result.translationResult;

					if ($scope.result.dict && $scope.result.dict.length > 0) {
						$scope.entries = $scope.result.dict[0].entry;
					}
					$scope.$apply();
				});
			};

			$scope.showDictTranslation = function () {
				return $scope.result && $scope.result.dict;
			};

			$scope.showSentenceTranslation = function () {
				return $scope.result && !$scope.result.dict && $scope.result.sentences;
			};

			$scope.isReturn = function (event) {
				return event.keyCode === 13;
			};

			// Entry Point
			$scope.init();
		}
	]);
})(window.angular);