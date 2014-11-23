(function (angular) {
	'use strict';

	var app = angular.module('50vad-popup-app', ['MessageServiceModule', 'ngSanitize', 'language-selector']);

	// ------------------------------------------
	// Controllers
	// ------------------------------------------
	app.controller('PopupController', [
		'$scope',
		'MessageService',
		function ($scope, MessageService) {
			var selectedVocable = {};

			$scope.q = '';
			$scope.fromLang = 'auto';
			$scope.toLang = 'en';
			$scope.translation = {
				v: '',
				t: '',
				sourceLanguage: ''
			};
			$scope.translationObject = {};

			$scope.init = function () {
				// connecting to background page
				chrome.runtime.connect();

				MessageService.sendMessage({
					type: 'GET-TARGET-LANGUAGE'
				}, function (language) {
					console.log('init toLang', language);
					$scope.toLang = language;
				});
			};

			$scope.search = function () {
				MessageService.sendMessage({
					type: 'SEARCH-VOCABLE',
					v: $scope.q,
					fromLang: $scope.fromLang,
					toLang: $scope.toLang
				}, function (result) {
					if (result.error) {
						return window.alert(result.error);
					}

					$scope.translationObject = result.translationResult;

					// setting source language
					console.log(result.translationResult);
					$scope.fromLang = result.translationResult.sourceLanguage;

					$scope.changeSelectedVocable(result.translationResult.sections[0].name, result.translationResult.sections[0].translations[0]);
					$scope.$apply();
				});
			};

			$scope.isSelected = function (section, translation) {
				return selectedVocable.section === section && selectedVocable.translation === translation;
			};

			$scope.changeSelectedVocable = function (section, translation) {
				selectedVocable.section = section;
				selectedVocable.translation = translation;

				MessageService.sendMessage({
					type: 'CHANGE-POPUP-TRANSLATION',
					v: $scope.translationObject.v,
					t: translation,
					sourceLanguage: $scope.translationObject.sourceLanguage
				});
			};

			$scope.showTranslation = function () {
				return $scope.translationObject.sections && $scope.translationObject.sections.length > 0;
			};

			$scope.isReturn = function (event) {
				return event.keyCode === 13;
			};

			$scope.fromLanguageSelected = function (language) {
				$scope.fromLang = language;
				$scope.search();
			};

			$scope.toLanguageSelected = function (language) {
				$scope.toLang = language;
				$scope.search();
			};

			// Entry Point
			$scope.init();
		}
	]);
})(window.angular);