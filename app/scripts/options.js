(function (angular, moment) {
	'use strict';

	var app = angular.module('50vad-options-app', ['MessageServiceModule', 'ngSanitize']);

	// ------------------------------------------
	// Configs
	// ------------------------------------------
	app.config(['$compileProvider', function ($compileProvider) {
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
	}]);
	
	// ------------------------------------------
	// Controllers
	// ------------------------------------------
	app.controller('OptionsController', [
		'$scope',
		'MessageService',
		function ($scope, MessageService) {
			$scope.vocables = {};
			$scope.shutupUntil = Date.now();
			$scope.nextVocableIn = Date.now();
			$scope.language = 'de';

			$scope.init = function () {
				MessageService.sendMessage({
					type: 'GET-ALL-VOCABLES'
				}, function (vocables) {
					$scope.vocables = vocables;
					$scope.$apply();
				});

				MessageService.sendMessage({
					type: 'GET-SHUT-UP-UNTIL'
				}, function (shutupUntil) {
					$scope.shutupUntil = shutupUntil;
					$scope.$apply();
				});

				MessageService.sendMessage({
					type: 'GET-NEXT-VOCABLE-IN-DATE'
				}, function (date) {
					$scope.nextVocableIn = date;
					$scope.$apply();
				});

				MessageService.sendMessage({
					type: 'GET-TARGET-LANGUAGE'
				}, function (language) {
					$scope.language = language;
					$scope.$apply();
				});
			};

			$scope.convertToReadable = function (timestamp) {
				return moment(parseInt(timestamp)).fromNow();
			};

			$scope.showShutupPanel = function () {
				console.log('shutup: ', $scope.shutupUntil > Date.now());
				return $scope.shutupUntil > Date.now();
			};

			$scope.resetShutupUntilValue = function () {
				MessageService.sendMessage({
					type: 'RESET-SHUT-UP-UNTIL'
				}, function () {
					// reload
					document.location.href = '50vad.html';
				});
			};

			$scope.showNextVocablePanel = function () {
				console.log('next: ', $scope.nextVocableIn > Date.now());
				return $scope.nextVocableIn > Date.now();
			};

			$scope.askNextVocable = function () {
				document.location.href = '50vad.html';
			};

			$scope.startNinjaMode = function () {
				MessageService.sendMessage({
					type: 'SET-NINJA-MODE',
					value: true
				}, function () {
					document.location.href = '50vad.html';
				});
			};

			$scope.changeTargetLanguage = function () {
				MessageService.sendMessage({
					type: 'CHANGE-TARGET-LANGUAGE',
					language: $scope.language
				}, function () {
					console.log('Target language changed to \'' + $scope.language + '\'');
				});
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
})(window.angular, window.moment);