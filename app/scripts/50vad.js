(function (angular) {
	'use strict';

	var app = angular.module('50vad-app', ['MessageServiceModule', 'ngSanitize']);

	// ------------------------------------------
	// Configs
	// ------------------------------------------
	app.config(['$compileProvider', function ($compileProvider) {
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
	}]);

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
			$scope.hintGiven = false;
			$scope.isFocused = false;

			$scope.ninjaMode = false;

			$scope.init = function () {
				MessageService.registerReceiver($scope.onMessage);

				MessageService.sendMessage({
					type: 'GET-NEXT-VOCABLE'
				}, function (result) {
					$scope.vocable = result.nextVocable;
					$scope.isFocused = true;
					$scope.ninjaMode = result.ninjaMode;
					$scope.$apply();
				});
			};

			$scope.checkTranslation = function () {
				if ($scope.translation === $scope.vocable.v) {
					$scope.isCorrect = true;

					if (!$scope.isIncorrect && !$scope.hintGiven) {
						// increasing level only if user made no mistake
						$scope.vocable.l++;
					}

					$scope.isIncorrect = false;
					MessageService.sendMessage({
						type: 'UPDATE-VOCABLE',
						vocable: $scope.vocable
					}, function () {
						window.setTimeout(function (hasNext) {
							if (hasNext || $scope.ninjaMode) {
								// load new vocable
								document.location.href = document.location.href;
							} else {
								// redirect to previous page
								window.history.back();
							}
						}, 1500);
					});
				} else {
					$scope.isIncorrect = true;
					$scope.vocable.l = 1;
				}
			};

			$scope.onMessage = function (message) {
				if (message.type === 'REDIRECT-URL') {
					$scope.redirectUrl = message.redirectUrl;
				}
			};

			$scope.showHint = function () {
				if ($scope.displayedChars < $scope.vocable.v.length) {
					$scope.displayedChars++;
					$scope.translation = $scope.vocable.v.substr(0, $scope.displayedChars);
					$scope.vocable.l = 1;
					$scope.hintGiven = true;
				}
			};

			$scope.isReturn = function (event) {
				return event.keyCode === 13;
			};

			$scope.shutup = function (duration) {
				MessageService.sendMessage({
					type: 'SHUT-UP',
					duration: duration
				});

				// redirect
				window.history.back();
			};

			$scope.toggleNinjaMode = function (value) {
				MessageService.sendMessage({
					type: 'SET-NINJA-MODE',
					value: value
				}, function () {
					console.log('done');
				});

				$scope.ninjaMode = value;
			};

			// start
			$scope.init();
		}
	]);

	// ------------------------------------------
	// Directives
	// ------------------------------------------
	app.directive('syncFocusWith', function () {
		return {
			restrict: 'A',
			scope: {
				focusValue: '=syncFocusWith'
			},
			link: function ($scope, $element) {
				$scope.$watch('focusValue', function (currentValue) {
					if (currentValue) {
						$element[0].focus();
					} else {
						$element[0].blur();
					}
				});
			}
		};
	});
})(window.angular);