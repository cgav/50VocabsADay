(function (angular) {
	'use strict';

	var app = angular.module('fvad-app-modal', ['language-selector', 'MessageServiceModule']),
		fvad = document.createElement('fvad-wrapper'),
		el = document.createElement('fvad-modal'),
		elOverlay = document.createElement('fvad-overlay');

	// ------------------------------------------
	// Services
	// ------------------------------------------
	app.service('DisplayService', function () {
		var me = this,
			hideModalCallback,
			hideOverlayCallback,
			showOverlayCallback;

		me.registerHideModalCallback = function (callback) {
			hideModalCallback = callback;
		};

		me.registerHideOverlayCallback = function (callback) {
			hideOverlayCallback = callback;
		};
		me.registerShowOverlayCallback = function (callback) {
			showOverlayCallback = callback;
		};

		// hide overlay
		me.hideOverlay = function () {
			if (typeof hideOverlayCallback === 'function') {
				hideOverlayCallback();
			}
		};
		me.showOverlay = function () {
			if (typeof showOverlayCallback === 'function') {
				showOverlayCallback();
			}
		};

		// hide modal
		me.hideModal = function () {
			if (typeof hideModalCallback === 'function') {
				hideModalCallback();
			}
		};

		return me;
	});

	// ------------------------------------------
	// Directives
	// ------------------------------------------
	app.directive('fvadOverlay', [
		'DisplayService',
		function (DisplayService) {
			return {
				restrict: 'E',
				link: function (scope, element) {
					var hideOverlay,
						showOverlay;

					//
					// Scope definitions
					//
					scope.overlayDisplayed = false;
					// scope.$apply();

					//
					// Helper functions
					//
					hideOverlay = function () {
						scope.overlayDisplayed = false;
						scope.$apply();
					};
					showOverlay = function () {
						scope.overlayDisplayed = true;
						scope.$apply();
					};

					//
					// Event listener
					//
					element.bind('click', function () {
						console.log('hi');
						DisplayService.hideOverlay();
						DisplayService.hideModal();
					});

					//
					// Entry point
					//
					DisplayService.registerHideOverlayCallback(hideOverlay);
					DisplayService.registerShowOverlayCallback(showOverlay);
				},
				template: '<div class="fvad-overlay" ng-show="overlayDisplayed"></div>',
				transclude: true
			};
		}
	]);

	app.directive('fvadModal', [
		'MessageService',
		'DisplayService',
		function (MessageService, DisplayService) {
			return {
				restrict: 'E',
				link: function (scope) {
					var getSentence,
						getSelection,
						hideModal,
						responseToTranslation;

					//
					// Scope definitions
					//
					scope.vocable = 'vocable';
					scope.translation = 'translation';
					scope.modalDisplayed = false;
					scope.fromLang = 'auto';
					scope.toLang = 'en';
					scope.dontAddTranslation = function () {
						if (typeof responseToTranslation === 'function') {
							responseToTranslation({store: false});
							scope.modalDisplayed = false;
						}

						DisplayService.hideOverlay();
					};
					scope.init = function () {
						MessageService.sendMessage({
							type: 'GET-TARGET-LANGUAGE'
						}, function (language) {
							scope.toLang = language;
						});
					};
					scope.fromLanguageSelected = function (language) {
						console.log('from selected language', language);
					};
					scope.toLanguageSelected = function (language) {
						console.log('to selected language', language);
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

					hideModal = function () {
						if (typeof responseToTranslation === 'function') {
							responseToTranslation({store: true});
						}
						scope.modalDisplayed = false;
						scope.$apply();
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
							scope.fromLang = message.sourceLanguage;
							DisplayService.showOverlay();
							DisplayService.registerHideModalCallback(hideModal);

							scope.modalDisplayed = true;
							scope.$apply();

							responseToTranslation = sendResponse;
						}
						return true;
					});

					//
					// Entry point
					//
					scope.init();
				},
				template:	'<div class="fvad-box" ng-show="modalDisplayed">' +
								'<p class="fvad-vocable">{{ vocable }}</p>' +
								'<p class="fvad-translation">{{ translation }}</p>' +
								'<div>' +
									'<span language-selector="fromLanguageSelected(language)" selection="fromLang"></span> &gt; ' +
									'<span language-selector="toLanguageSelected(language)" selection="toLang"></span>' +
								'</div>' +
								'<div class="fvad-button-area">' +
									'<button class="fvad-button fvad-dont-add-button" ng-click="dontAddTranslation()">Don\'t add vocable to training</button>' +
								'</div>' +
							'</div>'
			};
		}
	]);

	if (document.contentType === 'text/html') {
		// entry point
		fvad.appendChild(elOverlay);
		fvad.appendChild(el);
		document.body.appendChild(fvad);

		// bootstrapping angular
		angular.bootstrap(fvad, ['fvad-app-modal']);
	}
})(window.angular);