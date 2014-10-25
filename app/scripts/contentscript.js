(function (angular) {
	'use strict';

	var app = angular.module('fvad-app-modal', []),
		el = document.createElement('fvad-modal');

	// ------------------------------------------
	// Directives
	// ------------------------------------------
	app.directive('fvadModal', [function () {
		return {
			restrict: 'E',
			link: function (scope) {
				var getSentence,
					getSelection,
					responseToTranslation,
					lastCoords = {
						x: 0,
						y: 0
					};

				//
				// Scope definitions
				//
				scope.vocable = 'vocable';
				scope.translation = 'translation';
				scope.modalDisplayed = false;
				scope.dontAddTranslation = function () {
					if (typeof responseToTranslation === 'function') {
						responseToTranslation({store: false});
						scope.modalDisplayed = false;
					}
				};

				//
				// Helper functions
				//
				getSentence = function (text, from, to) {
					var stopChars = ':;.!?',
						fromIndex = from,
						toIndex = to,
						sentence = '';

					text = text.substr(0, from) + '<b>' + text.substr(from, to - from) + '</b>' + text.substr(to);
					while (stopChars.indexOf(text[fromIndex - 1]) === -1 && fromIndex > 0) {
						fromIndex--;
					}

					while (stopChars.indexOf(text[toIndex - 1]) === -1 && toIndex < text.length) {
						toIndex++;
					}

					sentence = text.substr(fromIndex, toIndex - fromIndex);
					return sentence;
				};

				getSelection = function () {
					var selection = window.getSelection(),
						from = selection.anchorOffset,
						to = selection.focusOffset,
						sentence = getSentence(selection.focusNode.textContent, from, to),
						totalSentence = '',
						selectionObject,
						childNodes = selection.anchorNode.parentNode.childNodes;

					for (var i = 0; i < childNodes.length; i++) {
						if (childNodes[i] === selection.anchorNode) {
							totalSentence += sentence;
						} else {
							totalSentence += childNodes[i].textContent.trim() + ' ';
						}
					}

					selectionObject = {
						selection: selection.toString(),
						from: from,
						to: to,
						sentence: sentence
					};

					return selectionObject;
				};

				//
				// Event listener
				//
				chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
					if (message.type === 'GET-SELECTION') {
						return sendResponse(getSelection());
					} else if (message.type === 'TRANSLATION') {
						scope.vocable = message.vocable;
						scope.translation = message.translation;
						scope.modalDisplayed = true;
						scope.$apply();

						responseToTranslation = sendResponse;
					}
					return true;
				});

				window.oncontextmenu = function (event) {
					lastCoords.x = event.x;
					lastCoords.y = event.y;
				};

				window.document.addEventListener('click', function (event) {
					if (event.target.className.indexOf('fvad-') === 0) {
						return;
					}

					if (scope.modalDisplayed) {
						if (typeof responseToTranslation === 'function') {
							responseToTranslation({store: true});
						}
						scope.modalDisplayed = false;
						scope.$apply();
					}
				});
			},
			template:	'<div class="fvad-box" ng-show="modalDisplayed">' +
							'<p class="fvad-vocable">{{ vocable }}</p>' +
							'<p class="fvad-translation">{{ translation }}</p>' +
							'<div class="fvad-button-area">' +
								'<button class="fvad-button fvad-dont-add-button" ng-click="dontAddTranslation()">Don\'t add vocable to training</button>' +
							'</div>' +
						'</div>'
		};
	}]);

	// entry point
	document.body.appendChild(el);

	// bootstrapping angular
	angular.bootstrap(window.document, ['fvad-app-modal']);
})(window.angular);