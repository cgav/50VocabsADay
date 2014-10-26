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
			$scope.q = '';
			$scope.result = {};
			$scope.entries = [];
			$scope.fromLang = 'auto';
			$scope.toLang = 'en';
			$scope.translation = {
				v: '',
				t: '',
				sourceLanguage: ''
			};

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
					var baseForm = 'base_form',
						keys = {};

					if (result.error) {
						return window.alert(result.error);
					}

					console.log(result.translationResult);

					// setting source language
					$scope.translation.sourceLanguage = result.translationResult.src;
					$scope.fromLang = result.translationResult.src;

					// preparsing result entries
					$scope.entries = [];
					if (result.translationResult.dict && result.translationResult.dict.length > 0) {
						result.translationResult.dict[0].entry.forEach(function (entry) {
							if (!keys[entry.word]) {
								keys[entry.word] = true;
								$scope.entries.push(entry.word);
							}
						});
						$scope.translation.v = result.translationResult.dict[0][baseForm];
					} else if (result.translationResult.sentences && result.translationResult.sentences.length > 0) {
						$scope.entries.push(result.translationResult.sentences[0].trans);
						$scope.translation.v = result.translationResult.sentences[0].orig;
					}
					$scope.translation.t = $scope.entries[0];
					$scope.changeTranslation($scope.translation.v, $scope.translation.t, $scope.fromLang);
					$scope.$apply();
				});
			};

			$scope.changeTranslation = function (v, t, sourceLanguage) {
				$scope.translation.t = t;
				$scope.$apply();

				MessageService.sendMessage({
					type: 'CHANGE-POPUP-TRANSLATION',
					v: v,
					t: t,
					sourceLanguage: sourceLanguage
				});

				console.log('sending ', sourceLanguage);
			};

			$scope.showTranslation = function () {
				return $scope.entries.length > 0;
			};

			$scope.isReturn = function (event) {
				return event.keyCode === 13;
			};

			$scope.fromLanguageSelected = function (language) {
				console.log('from language selected', language);
				$scope.fromLang = language;
				$scope.search();
			};

			$scope.toLanguageSelected = function (language) {
				console.log('to language selected', language);
				$scope.toLang = language;
				$scope.search();
			};

			// Entry Point
			$scope.init();
		}
	]);
})(window.angular);